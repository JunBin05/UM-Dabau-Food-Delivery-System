package controller; // or package service; if you made a new folder

import org.springframework.stereotype.Service;

import data_structures.OrderQueue;
import data_structures.RiderHeap;

@Service // <-- This tells Spring Boot to create EXACTLY ONE instance of this class to share!
public class DeliveryService {
    
    // The shared brain for the whole app
    private final OrderQueue globalOrderQueue = new OrderQueue();
    private final RiderHeap globalRiderHeap = new RiderHeap(100);

    public OrderQueue getOrderQueue() {
        return globalOrderQueue;
    }

    public RiderHeap getRiderHeap() {
        return globalRiderHeap;
    }
}