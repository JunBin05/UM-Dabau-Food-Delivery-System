package com.umdabau.controller; // or package service; if you made a new folder

import org.springframework.stereotype.Service;

import com.umdabau.data_structures.OrderQueue;
import com.umdabau.data_structures.RiderHeap;
import com.umdabau.data_structures.UMGraph;

@Service // <-- This tells Spring Boot to create EXACTLY ONE instance of this class to share!
public class DeliveryService {
    
    // The shared brain for the whole app
    private final OrderQueue globalOrderQueue = new OrderQueue();
    private final RiderHeap globalRiderHeap = new RiderHeap(100);
    private final UMGraph campusMap = new UMGraph(120);

    public DeliveryService() {
        campusMap.initializeCampusMap();
    }

    public OrderQueue getOrderQueue() {
        return globalOrderQueue;
    }

    public RiderHeap getRiderHeap() {
        return globalRiderHeap;
    }

    public UMGraph getCampusMap() {
        return campusMap;
    }
}
