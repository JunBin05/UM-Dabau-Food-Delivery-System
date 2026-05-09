🔌 UM-Dabau API Contract (v1.0)
Base URL: http://localhost:8080
Content-Type: application/json
This document strictly defines how the React/Vue Frontend communicates with the Spring Boot Backend.
1. Authentication & User Management
Owner: Norman (UserHashMap) & Vincent (Frontend)
POST /api/auth/login
Purpose: Authenticates a user and returns their profile so the frontend knows if they are a CUSTOMER, RIDER, or ADMIN.
Request Payload (Frontend sends):

JSON


{
  "userId": "U-1001",
  "password": "password123"
}


Success Response (Backend returns):

JSON


{
  "userId": "U-1001",
  "name": "Lim Jun Bin",
  "role": "CUSTOMER",
  "isAvailable": false,
  "currentNodeId": "NODE_FSKTM",
  "preferredZoneId": null
}


2. Menu & Catalog
Owner: Norman (MenuBST)
GET /api/menu
Purpose: Fetches the entire food catalog sorted alphabetically.
Request Payload: None
Success Response (Backend returns an Array of MenuItems):

JSON


[
  {
    "itemId": "M-01",
    "restaurantId": "R-500",
    "name": "Ayam Goreng",
    "price": 12.50,
    "category": "Mains"
  },
  {
    "itemId": "M-02",
    "restaurantId": "R-500",
    "name": "Teh Tarik",
    "price": 3.00,
    "category": "Drinks"
  }
]


3. Order Processing
Owner: JunJing (OrderQueue & RiderHeap)
POST /api/orders
Purpose: Submits a confirmed cart to the backend to be placed in the FIFO Queue.
Request Payload (Frontend sends):

JSON


{
  "customerId": "U-1001",
  "restaurantId": "R-500",
  "deliveryNodeId": "NODE_FSKTM",
  "cartItems": ["M-01", "M-02"], 
  "totalPrice": 15.50
}


Success Response (Backend creates OrderId and returns it):

JSON


{
  "orderId": "ORD-9923",
  "status": "PENDING",
  "message": "Order successfully placed in Queue."
}


4. Rider Dispatch & Routing
Owner: JunBin (UMGraph & Dijkstra) & JunJing (RiderHeap)
POST /api/riders/online
Purpose: A rider clicks "Go Online" on their app. This injects them into the Min-Heap for dispatch.
Request Payload:

JSON


{
  "userId": "U-2005",
  "currentNodeId": "NODE_KK12",
  "preferredZoneId": "NODE_LIBRARY"
}


Success Response: 200 OK
GET /api/orders/{orderId}/route
Purpose: The frontend polls this endpoint while the user is waiting. Once JunJing's Min-Heap assigns a rider and JunBin's Dijkstra calculates the path, it returns the RouteSummary.
Request Payload: None (orderId is in the URL)
Success Response (Backend returns RouteSummary):

JSON


{
  "orderId": "ORD-9923",
  "assignedRiderId": "U-2005",
  "totalDistanceKm": 1.2,
  "estimatedTimeMinutes": 4.5,
  "path": [
    {
      "nodeId": "NODE_CENTRAL_EATERY",
      "name": "Central Eatery",
      "latitude": 3.1200,
      "longitude": 101.6500
    },
    {
      "nodeId": "NODE_LIBRARY",
      "name": "Main Library",
      "latitude": 3.1205,
      "longitude": 101.6558
    },
    {
      "nodeId": "NODE_FSKTM",
      "name": "Faculty of Computer Science",
      "latitude": 3.1280,
      "longitude": 101.6545
    }
  ]
}