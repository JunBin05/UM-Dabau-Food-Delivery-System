package com.umdabau.data_structures;

import java.io.FileWriter;
import java.io.IOException;

import com.umdabau.models.GraphNode;
import com.umdabau.models.RouteSummary;

// The Graph Engine
public class UMGraph {

    private GraphNode[] vertices;
    private Edge[] adjacencyList;
    private int numVertices;

    public UMGraph(int capacity) {
        this.vertices = new GraphNode[capacity];
        this.adjacencyList = new Edge[capacity];
        this.numVertices = 0;
    }

    public void addVertex(GraphNode node) {
        vertices[numVertices] = node;
        numVertices++;
    }

    private int getNodeIndex(GraphNode node) {
        for (int i = 0; i < numVertices; i++) {
            if (vertices[i] == node)
                return i;
        }
        return -1;
    }

    private int getNodeIndex(String nodeId) {
        for (int i = 0; i < numVertices; i++) {
            if (vertices[i].nodeId.equals(nodeId))
                return i;
        }
        return -1;
    }

    public GraphNode getNodeById(String nodeId) {
        int index = getNodeIndex(nodeId);
        if (index != -1) {
            return vertices[index];
        }
        System.out.println("WARNING: Could not find node with ID: " + nodeId);
        return null;
    }

    private int getMinTimeVertex(double[] times, boolean[] visited) {
        double minTime = Double.MAX_VALUE;
        int minIndex = -1;

        for (int v = 0; v < numVertices; v++) {
            if (!visited[v] && times[v] <= minTime) {
                minTime = times[v];
                minIndex = v;
            }
        }
        return minIndex;
    }

    // =========================================================================
    // THE ARCHITECT UPGRADE: Auto-Calculating Haversine Roads
    // =========================================================================
    private void addTwoWayRoad(GraphNode nodeA, GraphNode nodeB) {
        if (nodeA == null || nodeB == null)
            return;

        // 1. Calculate precise distance using the Haversine formula
        double R = 6371.0; // Radius of the earth in km
        double latDistance = Math.toRadians(nodeB.latitude - nodeA.latitude);
        double lonDistance = Math.toRadians(nodeB.longitude - nodeA.longitude);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(nodeA.latitude)) * Math.cos(Math.toRadians(nodeB.latitude))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceKm = R * c;

        // 2. Calculate time (Assuming 25 km/h average speed on campus)
        double speedKmH = 25.0;
        double timeMinutes = (distanceKm / speedKmH) * 60.0;

        // Give a minimum time of 1 min for super close waypoints
        if (timeMinutes < 1)
            timeMinutes = 1;

        addEdge(nodeA, nodeB, distanceKm, timeMinutes);
        addEdge(nodeB, nodeA, distanceKm, timeMinutes);
    }

    // =========================================================================
    // NEW: One-Way Road (Directed Edge)
    // =========================================================================
    private void addOneWayRoad(GraphNode sourceNode, GraphNode destNode) {
        if (sourceNode == null || destNode == null)
            return;

        // 1. Calculate precise distance using the Haversine formula
        double R = 6371.0; // Radius of the earth in km
        double latDistance = Math.toRadians(destNode.latitude - sourceNode.latitude);
        double lonDistance = Math.toRadians(destNode.longitude - sourceNode.longitude);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(sourceNode.latitude)) * Math.cos(Math.toRadians(destNode.latitude))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceKm = R * c;

        // 2. Calculate time (Assuming 25 km/h average speed on campus)
        double speedKmH = 25.0;
        double timeMinutes = (distanceKm / speedKmH) * 60.0;

        // Give a minimum time of 1 min for super close waypoints
        if (timeMinutes < 1)
            timeMinutes = 1;

        // 3. THE DIFFERENCE: Only add ONE edge!
        // The rider can go from Source -> Dest, but NOT Dest -> Source.
        addEdge(sourceNode, destNode, distanceKm, timeMinutes);
    }

    public void addEdge(GraphNode sourceNode, GraphNode targetNode, double distanceKm, double baseTimeMinutes) {
        int sourceIndex = getNodeIndex(sourceNode);
        Edge newEdge = new Edge(targetNode, distanceKm, baseTimeMinutes);
        newEdge.nextEdge = adjacencyList[sourceIndex];
        adjacencyList[sourceIndex] = newEdge;
    }

    public RouteSummary runDijkstra(String startNodeId, String endNodeId, String orderId, String assignedRiderId) {
        int startIndex = getNodeIndex(startNodeId);
        int endIndex = getNodeIndex(endNodeId);

        if (startIndex == -1 || endIndex == -1) {
            throw new IllegalArgumentException("Start or End Node does not exist.");
        }

        double[] shortestTimes = new double[numVertices];
        double[] totalDistances = new double[numVertices];
        boolean[] visited = new boolean[numVertices];
        int[] previousNodes = new int[numVertices];

        for (int i = 0; i < numVertices; i++) {
            shortestTimes[i] = Double.MAX_VALUE;
            totalDistances[i] = Double.MAX_VALUE;
            visited[i] = false;
            previousNodes[i] = -1;
        }

        shortestTimes[startIndex] = 0.0;
        totalDistances[startIndex] = 0.0;

        for (int count = 0; count < numVertices - 1; count++) {
            int u = getMinTimeVertex(shortestTimes, visited);
            if (u == -1)
                break;

            visited[u] = true;

            Edge currentEdge = adjacencyList[u];
            while (currentEdge != null) {
                int v = getNodeIndex(currentEdge.targetNode.nodeId);

                if (!visited[v] && shortestTimes[u] != Double.MAX_VALUE) {
                    double newTime = shortestTimes[u] + currentEdge.baseTimeMinutes;
                    if (newTime < shortestTimes[v]) {
                        shortestTimes[v] = newTime;
                        totalDistances[v] = totalDistances[u] + currentEdge.distanceKm;
                        previousNodes[v] = u;
                    }
                }
                currentEdge = currentEdge.nextEdge;
            }
        }
        return buildRouteSummary(orderId, assignedRiderId, previousNodes, endIndex, totalDistances[endIndex],
                shortestTimes[endIndex]);
    }

    private RouteSummary buildRouteSummary(String orderId, String riderId, int[] previousNodes, int endIndex,
            double totalDistance, double totalTime) {
        int stepCount = 0;
        int curr = endIndex;
        while (curr != -1) {
            stepCount++;
            curr = previousNodes[curr];
        }

        GraphNode[] finalPath = new GraphNode[stepCount];
        curr = endIndex;
        for (int i = stepCount - 1; i >= 0; i--) {
            finalPath[i] = vertices[curr];
            curr = previousNodes[curr];
        }

        return new RouteSummary(orderId, riderId, finalPath, totalDistance, totalTime);
    }

    public void initializeCampusMap() {
        GraphNode hubKk8Kk10 = new GraphNode("HUB_KK8_10", "KK8 & KK10 Main Road Junction", 3.1298838088323366,
                101.65053856131739);
        addVertex(hubKk8Kk10);

        GraphNode cafeKk8 = new GraphNode("NODE_CAFE_KK8", "Cafe KK8", 3.130163407514807, 101.64901616349572);
        addVertex(cafeKk8);

        GraphNode cafeKk10 = new GraphNode("NODE_CAFE_KK10", "Cafe KK10", 3.13112311986495, 101.64972747196668);
        addVertex(cafeKk10);

        GraphNode kk8Main = new GraphNode("NODE_KK8", "Kinabalu Residential College (KK8)", 3.1299967273497584,
                101.64933013205756);
        addVertex(kk8Main);

        GraphNode kk10Main = new GraphNode("NODE_KK10", "Tun Ahmad Zaidi Residential College (KK10)",
                3.1306339266496503, 101.65047440372254);
        addVertex(kk10Main);

        addTwoWayRoad(getNodeById("HUB_KK8_10"), getNodeById("NODE_KK8"));
        addTwoWayRoad(getNodeById("HUB_KK8_10"), getNodeById("NODE_CAFE_KK8"));
        addTwoWayRoad(getNodeById("HUB_KK8_10"), getNodeById("NODE_KK10"));
        addTwoWayRoad(getNodeById("HUB_KK8_10"), getNodeById("NODE_CAFE_KK10"));

        GraphNode curve1 = new GraphNode("WAYPOINT_1", "Road Curve: KK8 to FSKTM", 3.128459059001945,
                101.64966469061362);
        addVertex(curve1);
        addTwoWayRoad(getNodeById("HUB_KK8_10"), getNodeById("WAYPOINT_1"));

        GraphNode fsktm = new GraphNode("NODE_FSKTM", "Faculty of Computer Science and IT (FSKTM)", 3.1278141116117237,
                101.6502887915006);
        addVertex(fsktm);
        addTwoWayRoad(getNodeById("WAYPOINT_1"), getNodeById("NODE_FSKTM"));

        GraphNode curve2 = new GraphNode("WAYPOINT_2", "Road Curve: FSKTM to APM", 3.127174249318725,
                101.6510665076122);
        addVertex(curve2);
        addTwoWayRoad(getNodeById("NODE_FSKTM"), getNodeById("WAYPOINT_2"));

        GraphNode apm = new GraphNode("NODE_APM", "Akademi Pengajian Melayu (APM)", 3.1261952217831452,
                101.65158220167542);
        addVertex(apm);
        addTwoWayRoad(getNodeById("WAYPOINT_2"), getNodeById("NODE_APM"));

        GraphNode kk347 = new GraphNode("NODE_KK3_4_7", "Residential Colleges Hub (KK3, KK4, KK7)", 3.124389104105036,
                101.65150610294981);
        addVertex(kk347);
        addTwoWayRoad(getNodeById("NODE_APM"), getNodeById("NODE_KK3_4_7"));

        GraphNode kk3 = new GraphNode("NODE_KK3", "Tuanku Kurshiah Residential College (KK3)", 3.124800058728326,
                101.65087427030649);
        addVertex(kk3);
        GraphNode kk47 = new GraphNode("NODE_KK4&7", "Bestari & Za'ba Residential Colleges (KK4 & KK7)",
                3.125405207753598, 101.6500502709681);
        addVertex(kk47);

        addTwoWayRoad(getNodeById("NODE_KK3_4_7"), getNodeById("NODE_KK3"));
        addTwoWayRoad(getNodeById("NODE_KK3"), getNodeById("NODE_KK4&7"));

        GraphNode itGraphNode = new GraphNode("NODE_IT", "Information Technology Department", 3.1231831238069208,
                101.65126037336887);
        addVertex(itGraphNode);
        addTwoWayRoad(getNodeById("NODE_KK3_4_7"), getNodeById("NODE_IT"));

        GraphNode fll = new GraphNode("NODE_FLL", "Faculty of Languages and Linguistics (FLL)", 3.1226577473881956,
                101.65162331759544);
        addVertex(fll);
        addTwoWayRoad(getNodeById("NODE_IT"), getNodeById("NODE_FLL"));

        GraphNode curve3 = new GraphNode("WAYPOINT_3", "Road Curve: Near FLL", 3.121908664405822, 101.65159894710494);
        addVertex(curve3);
        addTwoWayRoad(getNodeById("NODE_FLL"), getNodeById("WAYPOINT_3"));

        GraphNode curve4 = new GraphNode("WAYPOINT_4", "Road Curve: FLL to KK9", 3.1216783367427445,
                101.65131463294118);
        addVertex(curve4);
        addTwoWayRoad(getNodeById("WAYPOINT_3"), getNodeById("WAYPOINT_4"));

        GraphNode curve4_5 = new GraphNode("WAYPOINT_4_5", "Road Curve: Towards Kafe Bahasa", 3.1216960364104915,
                101.65045516840225);
        addVertex(curve4_5);
        addTwoWayRoad(getNodeById("WAYPOINT_4"), getNodeById("WAYPOINT_4_5"));

        GraphNode kafeBahasa = new GraphNode("NODE_KAFE_BAHASA", "Kafe Bahasa", 3.1228155354894658, 101.65040152422043);
        addVertex(kafeBahasa);
        addTwoWayRoad(getNodeById("WAYPOINT_4_5"), getNodeById("NODE_KAFE_BAHASA"));

        GraphNode curve5 = new GraphNode("WAYPOINT_5", "Road Curve: Approaching KK9", 3.121644975046755,
                101.64982343392673);
        addVertex(curve5);
        addTwoWayRoad(getNodeById("WAYPOINT_4_5"), getNodeById("WAYPOINT_5"));

        GraphNode kk9entrance = new GraphNode("NODE_KK9_ENTRANCE", "Junction: KK9 Entrance", 3.121199165500728,
                101.64875728967331);
        addVertex(kk9entrance);
        addTwoWayRoad(getNodeById("WAYPOINT_5"), getNodeById("NODE_KK9_ENTRANCE"));

        GraphNode curve6 = new GraphNode("WAYPOINT_6", "Road Curve: KK9 Entrance", 3.121016067705886,
                101.64779716194032);
        addVertex(curve6);
        addTwoWayRoad(getNodeById("NODE_KK9_ENTRANCE"), getNodeById("WAYPOINT_6"));

        GraphNode curve7 = new GraphNode("WAYPOINT_7", "Road Curve: Inside KK9", 3.1199286594867965,
                101.64780068628656);
        addVertex(curve7);
        addTwoWayRoad(getNodeById("WAYPOINT_6"), getNodeById("WAYPOINT_7"));

        GraphNode kk9 = new GraphNode("NODE_KK9", "Tun Syed Zahiruddin Residential College (KK9)", 3.1200131184179,
                101.6462605469859);
        addVertex(kk9);
        addTwoWayRoad(getNodeById("WAYPOINT_7"), getNodeById("NODE_KK9"));

        GraphNode curve8 = new GraphNode("WAYPOINT_8", "Road Curve: KK10 Bus Stop", 3.130296143382264,
                101.65077389224481);
        addVertex(curve8);
        addTwoWayRoad(getNodeById("HUB_KK8_10"), getNodeById("WAYPOINT_8"));

        GraphNode curve9 = new GraphNode("WAYPOINT_9", "Road Curve: After KK10 Bus Stop", 3.130605103658039,
                101.65231605503185);
        addVertex(curve9);
        addTwoWayRoad(getNodeById("WAYPOINT_8"), getNodeById("WAYPOINT_9"));

        GraphNode curve10 = new GraphNode("WAYPOINT_10", "Road Curve: Uphill from KK10", 3.1326311846564963,
                101.65453874086634);
        addVertex(curve10);
        addTwoWayRoad(getNodeById("WAYPOINT_9"), getNodeById("WAYPOINT_10"));

        GraphNode curve11 = new GraphNode("WAYPOINT_11", "Road Curve: Approaching UM Arena", 3.1344270987600216,
                101.6552266079264);
        addVertex(curve11);
        addTwoWayRoad(getNodeById("WAYPOINT_10"), getNodeById("WAYPOINT_11"));

        GraphNode geologyFaculty = new GraphNode("NODE_GEOLOGY_FACULTY", "Road Curve: Department of Geology",
                3.122612891152524, 101.65264327936785);
        addVertex(geologyFaculty);
        addTwoWayRoad(getNodeById("NODE_FLL"), getNodeById("NODE_GEOLOGY_FACULTY"));

        GraphNode curve12 = new GraphNode("WAYPOINT_12", "Road Curve: Near Parcel@UM", 3.122578933856171,
                101.65313562118888);
        addVertex(curve12);
        addTwoWayRoad(getNodeById("NODE_GEOLOGY_FACULTY"), getNodeById("WAYPOINT_12"));

        GraphNode bayuCafe = new GraphNode("NODE_BAYU_CAFE", "Bayu Cafe", 3.1218051441249868, 101.65382493010937);
        addVertex(bayuCafe);
        addTwoWayRoad(getNodeById("NODE_BAYU_CAFE"), getNodeById("WAYPOINT_12"));

        GraphNode scienceFaculty = new GraphNode("NODE_SCIENCE_FACULTY", "Faculty of Science (Main Building)",
                3.1218448350739676, 101.65417876414439);
        addVertex(scienceFaculty);
        addTwoWayRoad(getNodeById("NODE_BAYU_CAFE"), getNodeById("NODE_SCIENCE_FACULTY"));

        GraphNode kafeSains = new GraphNode("NODE_KAFE_SAINS", "Kafe Sains", 3.1246393781286086, 101.65401843422788);
        addVertex(kafeSains);
        addTwoWayRoad(getNodeById("NODE_SCIENCE_FACULTY"), getNodeById("NODE_KAFE_SAINS"));

        GraphNode kps = new GraphNode("NODE_KPS", "Perdana Siswa Complex (KPS)", 3.1218266147115314, 101.6554780054011);
        addVertex(kps);
        

        GraphNode dtc = new GraphNode("NODE_DTC", "Dewan Tunku Canselor (DTC)", 3.1218270455920756, 101.65698707275085);
        addVertex(dtc);
        addOneWayRoad(getNodeById("NODE_KPS"), getNodeById("NODE_DTC"));

        GraphNode pusatAsasiSains = new GraphNode("NODE_PUSAT_ASASI_SAINS", "Pusat Asasi Sains (PASUM)",
                3.1217019614283794, 101.6582439271044);
        addVertex(pusatAsasiSains);
        addOneWayRoad(getNodeById("NODE_DTC"), getNodeById("NODE_PUSAT_ASASI_SAINS"));

        GraphNode curve13 = new GraphNode("WAYPOINT_13", "Road Curve: Near PASUM", 3.1217899514079446,
                101.65991329693982);
        addVertex(curve13);
        addOneWayRoad(getNodeById("NODE_PUSAT_ASASI_SAINS"), getNodeById("WAYPOINT_13"));

        GraphNode curve14 = new GraphNode("WAYPOINT_14", "Junction: KK1 / KK12", 3.1216172950361183,
                101.66033132827977);
        addVertex(curve14);
        addOneWayRoad(getNodeById("WAYPOINT_13"), getNodeById("WAYPOINT_14"));

        GraphNode curve15 = new GraphNode("WAYPOINT_15", "Road Curve: Towards KK12", 3.121653213885515,
                101.66067793233111);
        addVertex(curve15);
        addOneWayRoad(getNodeById("WAYPOINT_14"), getNodeById("WAYPOINT_15"));

        GraphNode curve16 = new GraphNode("WAYPOINT_16", "Road Curve: Towards KK1", 3.1213514178299984,
                101.66052157782643);
        addVertex(curve16);
        addOneWayRoad(getNodeById("WAYPOINT_15"), getNodeById("WAYPOINT_16"));
        addOneWayRoad(getNodeById("WAYPOINT_14"), getNodeById("WAYPOINT_16"));

        GraphNode curve17 = new GraphNode("WAYPOINT_17", "Road Curve: Near UMX", 3.1223901739608775, 101.6608445018257);
        addVertex(curve17);
        addTwoWayRoad(getNodeById("WAYPOINT_15"), getNodeById("WAYPOINT_17"));

        GraphNode umx = new GraphNode("NODE_UMX", "UM Innovation Incubator Complex (UMX)", 3.1237858797248115,
                101.66063414039992);
        addVertex(umx);
        addTwoWayRoad(getNodeById("WAYPOINT_17"), getNodeById("NODE_UMX"));

        GraphNode ips = new GraphNode("NODE_IPS", "Institut Pengajian Siswazah (IPS)", 3.124718029814381,
                101.6600860666138);
        addVertex(ips);
        addTwoWayRoad(getNodeById("NODE_UMX"), getNodeById("NODE_IPS"));

        GraphNode yogo = new GraphNode("NODE_YOGO", "Yogo @ Universiti Malaya", 3.1247366845149034, 101.66080114931675);
        addVertex(yogo);
        addTwoWayRoad(getNodeById("NODE_IPS"), getNodeById("NODE_YOGO"));

        GraphNode curve18 = new GraphNode("WAYPOINT_18", "Road Curve: KK12 Food Court", 3.124754638785112,
                101.66143573129871);
        addVertex(curve18);
        addTwoWayRoad(getNodeById("NODE_YOGO"), getNodeById("WAYPOINT_18"));

        GraphNode foodyAvenue = new GraphNode("NODE_FOODY_AVENUE_HESHE12", "Foody Avenue & He & She Coffee (KK12)",
                3.1258258595003636, 101.66148534130396);
        addVertex(foodyAvenue);
        addTwoWayRoad(getNodeById("WAYPOINT_18"), getNodeById("NODE_FOODY_AVENUE_HESHE12"));

        GraphNode kk12BlockB = new GraphNode("NODE_KK12_BLOCK_B",
                "Raja Dr. Nazrin Shah Residential College (KK12 - Block B)", 3.1259016689864056, 101.66080174130775);
        addVertex(kk12BlockB);
        addTwoWayRoad(getNodeById("NODE_FOODY_AVENUE_HESHE12"), getNodeById("NODE_KK12_BLOCK_B"));

        GraphNode curve19 = new GraphNode("WAYPOINT_19", "Road Curve: KK12 Hub", 3.126118828929573, 101.66013602942144);
        addVertex(curve19);
        addTwoWayRoad(getNodeById("NODE_KK12_BLOCK_B"), getNodeById("WAYPOINT_19"));

        GraphNode noviKafe = new GraphNode("NODE_NOVI_KAFE", "Novi Kafe (KK12)", 3.126401871049149, 101.66015766652743);
        addVertex(noviKafe);
        addTwoWayRoad(getNodeById("WAYPOINT_19"), getNodeById("NODE_NOVI_KAFE"));

        GraphNode curve20 = new GraphNode("WAYPOINT_20", "Junction: Novi Kafe / KK12 Block A", 3.126882781200673,
                101.6602367743631);
        addVertex(curve20);
        addTwoWayRoad(getNodeById("NODE_NOVI_KAFE"), getNodeById("WAYPOINT_20"));

        GraphNode kk12BlockA = new GraphNode("NODE_KK12_BLOCK_A",
                "Raja Dr. Nazrin Shah Residential College (KK12 - Block A)", 3.1265502054052776, 101.66117198357561);
        addVertex(kk12BlockA);
        addTwoWayRoad(getNodeById("WAYPOINT_20"), getNodeById("NODE_KK12_BLOCK_A"));

        GraphNode curve21 = new GraphNode("WAYPOINT_21", "Road Curve: KK12 Block A", 3.126461216642615,
                101.6615935964476);
        addVertex(curve21);
        addTwoWayRoad(getNodeById("NODE_KK12_BLOCK_A"), getNodeById("WAYPOINT_21"));
        addTwoWayRoad(getNodeById("WAYPOINT_21"), getNodeById("NODE_FOODY_AVENUE_HESHE12"));

        GraphNode umcced = new GraphNode("NODE_UMCCED", "Universiti Malaya Centre for Continuing Education (UMCCed)",
                3.125704738711833, 101.65963289137662);
        addVertex(umcced);
        addTwoWayRoad(getNodeById("NODE_IPS"), getNodeById("NODE_UMCCED"));

        GraphNode kk5 = new GraphNode("NODE_KK5", "Kolej Kediaman 5 (KK5)", 3.126541202953022, 101.65977479449877);
        addVertex(kk5);
        addTwoWayRoad(getNodeById("NODE_UMCCED"), getNodeById("NODE_KK5"));

        GraphNode curve22 = new GraphNode("WAYPOINT_22", "Junction: KK12 Entrance", 3.126983046914365,
                101.65985619830393);
        addVertex(curve22);
        addTwoWayRoad(getNodeById("NODE_KK5"), getNodeById("WAYPOINT_22"));
        addTwoWayRoad(getNodeById("WAYPOINT_22"), getNodeById("WAYPOINT_20"));

        GraphNode curve23 = new GraphNode("WAYPOINT_23", "Road Curve: Near KK5", 3.1269662318176255,
                101.65913610031154);
        addVertex(curve23);
        addTwoWayRoad(getNodeById("NODE_KK5"), getNodeById("WAYPOINT_23"));

        GraphNode warongKakiLima = new GraphNode("NODE_WARONG_LIMA", "Warong Kaki Lima (KK5)", 3.128135965266147,
                101.65892310424562);
        addVertex(warongKakiLima);
        addTwoWayRoad(getNodeById("WAYPOINT_23"), getNodeById("NODE_WARONG_LIMA"));

        GraphNode tennis = new GraphNode("NODE_TENNIS", "PerfectSports Tennis Club", 3.1285192772164256,
                101.66015823050942);
        addVertex(tennis);
        addTwoWayRoad(getNodeById("WAYPOINT_22"), getNodeById("NODE_TENNIS"));

        GraphNode kk11 = new GraphNode("NODE_KK11", "Kolej Kediaman 11 (KK11)", 3.1292378065248214, 101.66018602419174);
        addVertex(kk11);
        addTwoWayRoad(getNodeById("NODE_TENNIS"), getNodeById("NODE_KK11"));

        GraphNode kk11FoodCourt = new GraphNode("NODE_KK11_FOODCOURT", "KK11 Food Court", 3.1292546424593852,
                101.66094289917316);
        addVertex(kk11FoodCourt);
        addTwoWayRoad(getNodeById("NODE_KK11"), getNodeById("NODE_KK11_FOODCOURT"));

        GraphNode arena = new GraphNode("NODE_UM_ARENA", "UM Arena", 3.131181309304258, 101.66028582679672);
        addVertex(arena);
        addTwoWayRoad(getNodeById("NODE_KK11"), getNodeById("NODE_UM_ARENA"));

        GraphNode curve24 = new GraphNode("WAYPOINT_24", "Road Curve: Near UM Arena", 3.1319077215730178,
                101.6594599972448);
        addVertex(curve24);
        addTwoWayRoad(getNodeById("NODE_UM_ARENA"), getNodeById("WAYPOINT_24"));

        GraphNode api = new GraphNode("NODE_API", "Akademi Pengajian Islam (API)", 3.1318927208175134,
                101.65845043868828);
        addVertex(api);
        addTwoWayRoad(getNodeById("WAYPOINT_24"), getNodeById("NODE_API"));

        GraphNode curve25 = new GraphNode("WAYPOINT_25", "Road Curve: Approaching API", 3.1333700400137454,
                101.65923082700296);
        addVertex(curve25);
        addTwoWayRoad(getNodeById("WAYPOINT_24"), getNodeById("WAYPOINT_25"));

        GraphNode curve26 = new GraphNode("WAYPOINT_26", "Road Curve: API Approach", 3.134296811008708,
                101.65860045231918);
        addVertex(curve26);
        addTwoWayRoad(getNodeById("WAYPOINT_25"), getNodeById("WAYPOINT_26"));

        GraphNode curve27 = new GraphNode("WAYPOINT_27", "Road Curve: Near API", 3.1345941498806433,
                101.65789273108844);
        addVertex(curve27);
        addTwoWayRoad(getNodeById("WAYPOINT_26"), getNodeById("WAYPOINT_27"));
        addTwoWayRoad(getNodeById("WAYPOINT_11"), getNodeById("WAYPOINT_27"));

        GraphNode curve28 = new GraphNode("WAYPOINT_28", "Road Curve: DTC to KL Gate", 3.1201906050210497,
                101.66089419144464);
        addVertex(curve28);
        addOneWayRoad(getNodeById("WAYPOINT_16"), getNodeById("WAYPOINT_28"));

        GraphNode curve29 = new GraphNode("WAYPOINT_29", "Road Curve: Approaching KL Gate", 3.119678689551388,
                101.66175131800983);
        addVertex(curve29);
        addOneWayRoad(getNodeById("WAYPOINT_28"), getNodeById("WAYPOINT_29"));

        GraphNode curve30 = new GraphNode("WAYPOINT_30", "Road Curve: KL Gate", 3.1190813484331894, 101.66213248953211);
        addVertex(curve30);
        addOneWayRoad(getNodeById("WAYPOINT_29"), getNodeById("WAYPOINT_30"));

        GraphNode curve31 = new GraphNode("WAYPOINT_31", "Road Curve: KL Gate (Outer)", 3.118810825810348,
                101.66203206680035);
        addVertex(curve31);
        addOneWayRoad(getNodeById("WAYPOINT_30"), getNodeById("WAYPOINT_31"));

        GraphNode curve32 = new GraphNode("WAYPOINT_32", "Junction: Q Bistro", 3.1187970790924164, 101.6616714617628);
        addVertex(curve32);
        addOneWayRoad(getNodeById("WAYPOINT_31"), getNodeById("WAYPOINT_32"));

        GraphNode qBistro = new GraphNode("NODE_Q_BISTRO", "Q Bistro Universiti Malaya", 3.118418137319431,
                101.6617929695634);
        addVertex(qBistro);
        addTwoWayRoad(getNodeById("WAYPOINT_32"), getNodeById("NODE_Q_BISTRO"));

        GraphNode lawFaculty = new GraphNode("NODE_LAW", "Faculty of Law", 3.118742650929227, 101.66105768741583);
        addVertex(lawFaculty);
        addOneWayRoad(getNodeById("WAYPOINT_32"), getNodeById("NODE_LAW"));

        GraphNode curve33 = new GraphNode("WAYPOINT_33", "Road Curve: Towards KK1", 3.118232836664097,
                101.65959369674684);
        addVertex(curve33);
        addOneWayRoad(getNodeById("NODE_LAW"), getNodeById("WAYPOINT_33"));

        GraphNode kk1 = new GraphNode("NODE_KK1", "Kolej Kediaman 1 (KK1)", 3.1179771487586265, 101.6595118392681);
        addVertex(kk1);
        addTwoWayRoad(getNodeById("WAYPOINT_33"), getNodeById("NODE_KK1"));

        GraphNode curve34 = new GraphNode("WAYPOINT_34", "Road Curve: Towards ASTAR Cafe", 3.1177172691867825,
                101.6602443588425);
        addVertex(curve34);
        addTwoWayRoad(getNodeById("NODE_KK1"), getNodeById("WAYPOINT_34"));

        GraphNode astarCafe = new GraphNode("NODE_ASTAR_CAFE", "ASTAR Cafe (First College)", 3.116805602261804,
                101.6601980859432);
        addVertex(astarCafe);
        addTwoWayRoad(getNodeById("WAYPOINT_34"), getNodeById("NODE_ASTAR_CAFE"));

        GraphNode curve35 = new GraphNode("WAYPOINT_35", "Junction: Exam Hall", 3.1182619069617092, 101.65868992694409);
        addVertex(curve35);
        addOneWayRoad(getNodeById("WAYPOINT_33"), getNodeById("WAYPOINT_35"));

        GraphNode examHall = new GraphNode("NODE_EXAM_HALL", "Examination Hall", 3.116982993758277, 101.65793074108801);
        addVertex(examHall);
        addTwoWayRoad(getNodeById("WAYPOINT_35"), getNodeById("NODE_EXAM_HALL"));

        GraphNode curve36 = new GraphNode("WAYPOINT_36", "Road Curve: Towards KK6", 3.1155130626008756,
                101.65614486657334);
        addVertex(curve36);
        addTwoWayRoad(getNodeById("NODE_EXAM_HALL"), getNodeById("WAYPOINT_36"));

        GraphNode kk6 = new GraphNode("NODE_KK6", "Kolej Kediaman 6 (KK6)", 3.115442023108182, 101.65561699325484);
        addVertex(kk6);
        addTwoWayRoad(getNodeById("WAYPOINT_36"), getNodeById("NODE_KK6"));

        GraphNode ToastKita = new GraphNode("NODE_TOAST_KITA", "Toast Kita Cafe", 3.1151732456684553,
                101.65543101763207);
        addVertex(ToastKita);
        addTwoWayRoad(getNodeById("NODE_KK6"), getNodeById("NODE_TOAST_KITA"));

        GraphNode builtEnv = new GraphNode("NODE_BUILT_ENV", "Faculty of Built Environment", 3.116128098720249,
                101.65423805139125);
        addVertex(builtEnv);
        addTwoWayRoad(getNodeById("NODE_KK6"), getNodeById("NODE_BUILT_ENV"));

        GraphNode curve37 = new GraphNode("WAYPOINT_37", "Junction: Faculty of Medicine", 3.1161465331712908,
                101.65393897104963);
        addVertex(curve37);
        addTwoWayRoad(getNodeById("NODE_BUILT_ENV"), getNodeById("WAYPOINT_37"));

        GraphNode curve38 = new GraphNode("WAYPOINT_38", "Junction: MediCafe", 3.1147401811469524, 101.65393178339764);
        addVertex(curve38);
        addTwoWayRoad(getNodeById("WAYPOINT_37"), getNodeById("WAYPOINT_38"));

        GraphNode mediCafe = new GraphNode("NODE_MEDI_CAFE", "MediCafe", 3.114715518661146, 101.65314141623303);
        addVertex(mediCafe);
        addTwoWayRoad(getNodeById("WAYPOINT_38"), getNodeById("NODE_MEDI_CAFE"));

        GraphNode medicine = new GraphNode("NODE_MEDICINE", "Faculty of Medicine", 3.116217483484387,
                101.6528847366064);
        addVertex(medicine);
        addTwoWayRoad(getNodeById("WAYPOINT_37"), getNodeById("NODE_MEDICINE"));

        GraphNode curve39 = new GraphNode("WAYPOINT_39", "Junction: Faculty of Pharmacy", 3.115605896628781,
                101.65286689702234);
        addVertex(curve39);
        addTwoWayRoad(getNodeById("NODE_MEDICINE"), getNodeById("WAYPOINT_39"));

        GraphNode pharmacy = new GraphNode("NODE_PHARMACY", "Faculty of Pharmacy", 3.1156039173827192,
                101.65234558473301);
        addVertex(pharmacy);
        addTwoWayRoad(getNodeById("WAYPOINT_39"), getNodeById("NODE_PHARMACY"));

        GraphNode curve40 = new GraphNode("WAYPOINT_40", "Junction: KK2 Cafe", 3.1183969226181927, 101.65847597260097);
        addVertex(curve40);
        addOneWayRoad(getNodeById("WAYPOINT_35"), getNodeById("WAYPOINT_40"));

        GraphNode cafeKk2 = new GraphNode("NODE_CAFE_KK2", "Cafe KK2 (Tuanku Bahiyah Cafe)", 3.1179514229225025,
                101.65787514343397);
        addVertex(cafeKk2);
        addTwoWayRoad(getNodeById("WAYPOINT_40"), getNodeById("NODE_CAFE_KK2"));

        GraphNode kk2 = new GraphNode("NODE_KK2", "Tuanku Bahiyah Residential College (KK2)", 3.1190499267850367,
                101.65682171469975);
        addVertex(kk2);
        addOneWayRoad(getNodeById("WAYPOINT_40"), getNodeById("NODE_KK2"));

        GraphNode curve41 = new GraphNode("WAYPOINT_41", "Junction: Faculty of Engineering", 3.1190746095990405,
                101.65644178747449);
        addVertex(curve41);
        addOneWayRoad(getNodeById("NODE_KK2"), getNodeById("WAYPOINT_41"));

        GraphNode engineering = new GraphNode("NODE_ENGINEERING", "Road Curve: Engineering Cafe", 3.118893241995705,
                101.655915371057);
        addVertex(engineering);
        addTwoWayRoad(getNodeById("WAYPOINT_41"), getNodeById("NODE_ENGINEERING"));

        GraphNode curve42 = new GraphNode("WAYPOINT_42", "Junction: Engineering Fac Chicken Rice", 3.1183524571765884,
                101.65588978434883);
        addVertex(curve42);
        addTwoWayRoad(getNodeById("NODE_ENGINEERING"), getNodeById("WAYPOINT_42"));

        GraphNode engChickenRice = new GraphNode("NODE_ENG_CHICKEN_RICE", "Engineering Fac Chicken Rice",
                3.11824691003974, 101.65638454312582);
        addVertex(engChickenRice);
        addTwoWayRoad(getNodeById("WAYPOINT_42"), getNodeById("NODE_ENG_CHICKEN_RICE"));

        GraphNode khShawarma = new GraphNode("NODE_KH_SHAWARMA", "KH Shawarma", 3.117100461205459, 101.6557028330126);
        addVertex(khShawarma);
        addTwoWayRoad(getNodeById("WAYPOINT_42"), getNodeById("NODE_KH_SHAWARMA"));

        GraphNode curve43 = new GraphNode("WAYPOINT_43", "Junction: PJ Gate / Library", 3.1192086804350523,
                101.65482460211082);
        addVertex(curve43);
        addOneWayRoad(getNodeById("WAYPOINT_41"), getNodeById("WAYPOINT_43"));

        GraphNode curve44 = new GraphNode("WAYPOINT_44", "Road Curve: PJ Gate to Library", 3.1194536701545346,
                101.65458387816288);
        addVertex(curve44);
        addOneWayRoad(getNodeById("WAYPOINT_43"), getNodeById("WAYPOINT_44"));

        GraphNode library = new GraphNode("NODE_LIBRARY", "UM Central Library", 3.120295528212342, 101.65459540772146);
        addVertex(library);
        addOneWayRoad(getNodeById("WAYPOINT_44"), getNodeById("NODE_LIBRARY"));

        GraphNode zus = new GraphNode("NODE_ZUS", "ZUS Coffee", 3.120509846723895, 101.65459257602762);
        addVertex(zus);
        addOneWayRoad(getNodeById("NODE_LIBRARY"), getNodeById("NODE_ZUS"));

        GraphNode curve45 = new GraphNode("WAYPOINT_45", "Junction: KPS / UM Central", 3.121291513140947,
                101.6545910870507);
        addVertex(curve45);
        addOneWayRoad(getNodeById("NODE_ZUS"), getNodeById("WAYPOINT_45"));

        GraphNode curve46 = new GraphNode("WAYPOINT_46", "Road Curve: Towards KPS", 3.121489441892216,
                101.65473463698743);
        addVertex(curve46);
        addOneWayRoad(getNodeById("WAYPOINT_45"), getNodeById("WAYPOINT_46"));
        addOneWayRoad(getNodeById("WAYPOINT_46"), getNodeById("NODE_KPS"));

        GraphNode curve47 = new GraphNode("WAYPOINT_47", "Road Curve: Bayu Cafe to KPS", 3.121459188273624,
                101.65441670352058);
        addVertex(curve47);
        addTwoWayRoad(getNodeById("WAYPOINT_47"), getNodeById("NODE_BAYU_CAFE"));
        addOneWayRoad(getNodeById("WAYPOINT_45"), getNodeById("WAYPOINT_47"));
        addOneWayRoad(getNodeById("WAYPOINT_47"), getNodeById("WAYPOINT_46"));

        GraphNode curve48 = new GraphNode("WAYPOINT_48", "Road Curve: Towards UM Central", 3.121591694415608,
                101.65355007276575);
        addVertex(curve48);
        addTwoWayRoad(getNodeById("WAYPOINT_48"), getNodeById("NODE_BAYU_CAFE"));
        addTwoWayRoad(getNodeById("WAYPOINT_12"), getNodeById("WAYPOINT_48"));

        GraphNode umCentral_heSheCentral = new GraphNode("NODE_UM_CENTRAL", "UM Central & He & She Coffee",
                3.120983186798967, 101.65350583982082);
        addVertex(umCentral_heSheCentral);
        addTwoWayRoad(getNodeById("WAYPOINT_48"), getNodeById("NODE_UM_CENTRAL"));

        GraphNode studyArea = new GraphNode("Node_Study_Area", "Student Study Area", 3.120578612165614,
                101.65351575629097);
        addVertex(studyArea);
        addTwoWayRoad(getNodeById("Node_Study_Area"), getNodeById("NODE_UM_CENTRAL"));

        GraphNode EduFac = new GraphNode("Node_Edu_Fac", "Faculty of Education (FPE)", 3.1200481391695933,
                101.65352131045543);
        addVertex(EduFac);
        addTwoWayRoad(getNodeById("Node_Study_Area"), getNodeById("Node_Edu_Fac"));

        GraphNode fbe = new GraphNode("NODE_FBE", "Faculty of Business & Economics (FBE)", 3.119480259028077,
                101.65210660115667);
        addVertex(fbe);
        addTwoWayRoad(getNodeById("Node_Edu_Fac"), getNodeById("NODE_FBE"));

        GraphNode pokokCafe = new GraphNode("NODE_POKOK_CAFE", "POKOK KL Cafe", 3.1183331667521137, 101.65005215480728);
        addVertex(pokokCafe);
        addTwoWayRoad(getNodeById("NODE_FBE"), getNodeById("NODE_POKOK_CAFE"));

        GraphNode curve49 = new GraphNode("WAYPOINT_49", "Road Curve: Library to FPE", 3.119373725076545,
                101.6541731604761);
        addVertex(curve49);
        addTwoWayRoad(getNodeById("WAYPOINT_49"), getNodeById("Node_Edu_Fac"));
        addOneWayRoad(getNodeById("WAYPOINT_49"), getNodeById("WAYPOINT_44"));

        System.out.println("UM Campus Graph successfully wired with Auto-Calculating Distances! Ready for routing.");
    }

    public void generateMapHTML() {
        System.out.println("Generating interactive Campus Map HTML...");
        try (FileWriter writer = new FileWriter("UM_Campus_Map.html")) {

            writer.write("<!DOCTYPE html>\n<html>\n<head>\n");
            writer.write("    <title>UM-Dabau Graph Visualizer</title>\n");
            writer.write("    <link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' />\n");
            writer.write("    <script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script>\n");
            
            // 🚀 NEW: We add the PolylineDecorator library to draw arrows!
            writer.write("    <script src='https://unpkg.com/leaflet-polylinedecorator/dist/leaflet.polylineDecorator.js'></script>\n");
            
            writer.write("    <style>#map { height: 100vh; width: 100%; margin: 0; padding: 0; }</style>\n");
            writer.write("</head>\n<body>\n");
            writer.write("<div id='map'></div>\n");

            writer.write("<script>\n");
            writer.write("    var map = L.map('map').setView([3.1209, 101.6521], 15);\n");
            writer.write("    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\n");
            writer.write("        maxZoom: 18,\n");
            writer.write("        attribution: '© OpenStreetMap'\n");
            writer.write("    }).addTo(map);\n\n");

            writer.write("    var nodes = {};\n");
            for (int i = 0; i < numVertices; i++) {
                if (vertices[i] != null) {
                    writer.write(String.format(
                            "    nodes['%s'] = { name: \"%s\", lat: %f, lng: %f, marker: null };\n",
                            vertices[i].nodeId, vertices[i].name, vertices[i].latitude, vertices[i].longitude));
                }
            }

            writer.write("\n    var edges = [\n");
            for (int i = 0; i < numVertices; i++) {
                Edge current = adjacencyList[i];
                while (current != null) {
                    writer.write(String.format(
                            "        { source: '%s', target: '%s' },\n",
                            vertices[i].nodeId, current.targetNode.nodeId));
                    current = current.nextEdge;
                }
            }
            writer.write("    ];\n\n");

            writer.write(
                """
                        var lines = [];
                        var drawnLines = new Set(); // To prevent drawing the base line twice

                        edges.forEach(edge => {
                        var start = nodes[edge.source];
                        var end = nodes[edge.target];
                        
                        if (start && end) {
                                var isTwoWay = edges.some(e => e.source === edge.target && e.target === edge.source);
                                var pairId = [edge.source, edge.target].sort().join('-');
                                
                                var lineColor = isTwoWay ? 'gray' : '#ff9900';
                                var lineDash = isTwoWay ? null : '8, 8';
                                var lineOpacity = isTwoWay ? 0.5 : 0.8;

                                // 1. Draw the BASE LINE (Only once per pair of buildings to prevent overlapping darkness)
                                if (!drawnLines.has(pairId)) {
                                var polyline = L.polyline([[start.lat, start.lng], [end.lat, end.lng]], {
                                        color: lineColor, weight: 3, opacity: lineOpacity, dashArray: lineDash
                                }).addTo(map);
                                drawnLines.add(pairId);
                                lines.push({ sourceId: edge.source, targetId: edge.target, line: polyline });
                                }

                                // 2. Draw the ARROWS (Draw for EVERY single edge!)
                                // 1-way gets a big arrow in the middle (50%). 2-way gets smaller arrows pushed back to 35%.
                                var arrowOffset = isTwoWay ? '35%' : '50%';
                                var arrowSize = isTwoWay ? 11 : 15;

                                L.polylineDecorator([[start.lat, start.lng], [end.lat, end.lng]], {
                                patterns: [
                                        { 
                                        offset: arrowOffset, 
                                        repeat: 0, 
                                        symbol: L.Symbol.arrowHead({
                                                pixelSize: arrowSize, 
                                                polygon: true, 
                                                pathOptions: {stroke: false, fillOpacity: 1, color: lineColor}
                                        }) 
                                        }
                                ]
                                }).addTo(map);
                        }
                        });

                        // Add the building markers
                        Object.keys(nodes).forEach(id => {
                        if (id.includes('WAYPOINT')) return; // Hides waypoints to make lines look like natural curves

                        var n = nodes[id];
                        var isFood = id.includes('CAFE') || id.includes('FOOD') || id.includes('BISTRO') || id.includes('ZUS') || id.includes('SHAWARMA') || id.includes('YOGO') || id.includes('TOAST');

                        var iconColor = isFood ? 'red' : 'blue';
                        var markerHtml = `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px black;"></div>`;
                        var customIcon = L.divIcon({ html: markerHtml, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });

                        var marker = L.marker([n.lat, n.lng], {icon: customIcon}).addTo(map);
                        marker.bindTooltip("<b>" + n.name + "</b><br><small>" + id + "</small>", {permanent: false, direction: 'top'});

                        marker.on('click', function() {
                                lines.forEach(l => {
                                l.line.setStyle({color: 'gray', weight: 2, opacity: 0.4});
                                l.line.bringToBack();
                                });

                                var connections = 0;
                                lines.forEach(l => {
                                if (l.sourceId === id || l.targetId === id) {
                                        l.line.setStyle({color: '#00ff00', weight: 5, opacity: 1.0, dashArray: null}); 
                                        l.line.bringToFront();
                                        connections++;
                                }
                                });
                                console.log(n.name + " has " + connections + " connected roads.");
                        });
                        });
                """);

            writer.write("</script>\n</body>\n</html>");
            System.out.println("SUCCESS! Open 'UM_Campus_Map.html' in your web browser.");

        } catch (IOException e) {
            System.out.println("An error occurred while writing the HTML file.");
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        UMGraph graph = new UMGraph(120);

        graph.initializeCampusMap();
        graph.generateMapHTML();

        System.out.println("\n--- NEW DELIVERY DISPATCH ---");
        System.out.println("Pickup: ZUS Coffee");
        System.out.println("Dropoff: FSKTM");
        System.out.println("Calculating optimal route...\n");

        // Notice I fixed the typo here: "NODE_ZUS" instead of "NODE_ZUS_COFFEE" so it
        // doesn't crash
        RouteSummary result = graph.runDijkstra("NODE_ZUS", "NODE_FSKTM", "ORD-1049", "RIDER-99");

        System.out.println("==== ROUTE SUMMARY ====");
        System.out.printf("Total Distance: %.2f km\n", result.getTotalDistanceKm());
        System.out.printf("Estimated Time: %.2f minutes\n", result.getEstimatedTimeMinutes());

        System.out.println("\nTurn-by-Turn Navigation:");
        GraphNode[] path = result.getPath();
        for (int i = 0; i < path.length; i++) {
            System.out.println((i + 1) + ". " + path[i].name);
        }
    }
}