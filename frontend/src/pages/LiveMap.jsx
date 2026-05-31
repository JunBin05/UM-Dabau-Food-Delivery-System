import React from "react";
// 1. Import Leaflet map components and CSS
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 2. The exact JSON payload from the Java Backend
const restaurantData = [
  { id: "NODE_ZUS", name: "ZUS Coffee", latitude: 3.120509, longitude: 101.654592 },
  { id: "NODE_UM_CENTRAL", name: "UM Central & He & She Coffee", latitude: 3.120983, longitude: 101.653505 },
  { id: "NODE_POKOK_CAFE", name: "POKOK KL Cafe", latitude: 3.118333, longitude: 101.650052 },
  { id: "NODE_FOODY_AVENUE_HESHE12", name: "Foody Avenue & He & She Coffee (KK12)", latitude: 3.125825, longitude: 101.661485 },
  { id: "NODE_NOVI_KAFE", name: "Novi Kafe (KK12)", latitude: 3.126401, longitude: 101.660157 },
  { id: "NODE_KAFE_BAHASA", name: "Kafe Bahasa", latitude: 3.122815, longitude: 101.650401 },
  { id: "NODE_BAYU_CAFE", name: "Bayu Cafe", latitude: 3.121805, longitude: 101.653824 },
  { id: "NODE_KAFE_SAINS", name: "Kafe Sains", latitude: 3.124639, longitude: 101.654018 },
  { id: "NODE_YOGO", name: "Yogo @ Universiti Malaya", latitude: 3.124736, longitude: 101.660801 },
  { id: "NODE_Q_BISTRO", name: "Q Bistro Universiti Malaya", latitude: 3.118418, longitude: 101.661792 },
  { id: "NODE_KH_SHAWARMA", name: "KH Shawarma", latitude: 3.117100, longitude: 101.655702 },
  { id: "NODE_ENG_CHICKEN_RICE", name: "Engineering Fac Chicken Rice", latitude: 3.118246, longitude: 101.656384 },
  { id: "NODE_TOAST_KITA", name: "Toast Kita Cafe", latitude: 3.115173, longitude: 101.655431 },
  { id: "NODE_MEDI_CAFE", name: "MediCafe", latitude: 3.114715, longitude: 101.653141 },
  { id: "NODE_ASTAR_CAFE", name: "ASTAR Cafe (First College)", latitude: 3.116805, longitude: 101.660198 },
  { id: "NODE_CAFE_KK2", name: "Cafe KK2 (Tuanku Bahiyah Cafe)", latitude: 3.117951, longitude: 101.657875 },
  { id: "NODE_WARONG_LIMA", name: "Warong Kaki Lima (KK5)", latitude: 3.128135, longitude: 101.658923 },
  { id: "NODE_CAFE_KK8", name: "Cafe KK8", latitude: 3.130163, longitude: 101.649016 },
  { id: "NODE_CAFE_KK10", name: "Cafe KK10", latitude: 3.131123, longitude: 101.649727 },
  { id: "NODE_KK11_FOODCOURT", name: "KK11 Food Court", latitude: 3.129254, longitude: 101.660942 }
];

// Vincent's existing mock data for UI cards
const preferredZones = [
  { name: "North Campus", demand: "High Demand", active: "12 Active", tone: "high" },
  { name: "Engineering Quad", demand: "Moderate", active: "5 Active", tone: "moderate" },
  { name: "South Dorms", demand: "Low Coverage", active: "1 Active", tone: "low" }
];

export default function LiveMap({ role = "admin", onNavigate = () => {} }) {
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const pageTitle = isAdmin ? "Live Map" : isCustomer ? "Delivery Map" : "Map Tracker";
  const eyebrow = isAdmin ? "Admin live map" : isCustomer ? "Full route map" : "Route tracker";

  return (
    <div className="page-stack map-page">
      <section className="page-heading map-page-heading compact-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{pageTitle}</h2>
        </div>
        <div className="map-heading-actions">
          {isCustomer && (
            <button className="secondary-button" type="button" onClick={() => onNavigate("order-tracking")}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Order Tracking
            </button>
          )}
          <span className="status-chip green">Live Map Active</span>
        </div>
      </section>

      {/* Main Map Container */}
      <section 
        className="live-map-dashboard" 
        style={{ position: "relative", height: "100%", minHeight: "600px", overflow: "hidden" }}
      >
        {/* 3. The Interactive Leaflet Map Layer */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <MapContainer 
            center={[3.1209, 101.6521]} // Centered on Universiti Malaya
            zoom={15} 
            style={{ height: "100%", width: "100%" }}
            zoomControl={false} // Hides default zoom buttons to keep UI clean
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {/* Draw a pin for every location in the backend JSON */}
            {restaurantData.map((restaurant) => (
              <Marker key={restaurant.id} position={[restaurant.latitude, restaurant.longitude]}>
                <Popup>
                  <strong>{restaurant.name}</strong><br/>
                  <small style={{color: "gray"}}>{restaurant.id}</small>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 4. Vincent's Floating UI Cards (Layered on top of the map using z-index) */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}>
          
          {isAdmin ? (
            <aside className="floating-map-card preferred-zones-card" style={{ pointerEvents: "auto" }}>
              <div className="card-header">
                <div>
                  <p className="eyebrow">Dispatch zones</p>
                  <h3>Preferred Zones</h3>
                </div>
                <span className="material-symbols-outlined">hub</span>
              </div>

              <div className="preferred-zone-list">
                {preferredZones.map((zone) => (
                  <div className="preferred-zone-row" key={zone.name}>
                    <span className={`zone-dot ${zone.tone}`}></span>
                    <div>
                      <strong>{zone.name}</strong>
                      <small>{zone.demand}</small>
                    </div>
                    <b>{zone.active}</b>
                  </div>
                ))}
              </div>

              <button className="primary-button rebalance-button" type="button">
                Rebalance Riders
              </button>
            </aside>
          ) : (
            <aside className="floating-map-card app-map-bottom-sheet" style={{ pointerEvents: "auto" }}>
              <div>
                <p className="eyebrow">{role === "rider" ? "Current job" : "Current delivery"}</p>
                <h3>{role === "rider" ? "Order #8842" : "Campus Cafe to you"}</h3>
                <span>{role === "rider" ? "Cafe Takdir to KK12, Block B" : "Rider is approaching Engineering Block C"}</span>
              </div>
              <div className="app-map-stats">
                <div>
                  <strong>12m</strong>
                  <small>ETA</small>
                </div>
                <div>
                  <strong>1.2 km</strong>
                  <small>Distance</small>
                </div>
                <span className="status-chip green">{role === "rider" ? "Accepted" : "Out for Delivery"}</span>
              </div>
            </aside>
          )}

          {isAdmin && (
            <section className="floating-map-card algorithm-status-card" style={{ pointerEvents: "auto" }}>
              <div>
                <span>Algorithm Status</span>
                <strong>Optimizing Routes</strong>
              </div>
              <div>
                <span>Active Nodes</span>
                <strong>1,204</strong>
              </div>
              <div>
                <span>Avg ETA</span>
                <strong>14m</strong>
              </div>
              <div>
                <span>Pending</span>
                <strong>28</strong>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}