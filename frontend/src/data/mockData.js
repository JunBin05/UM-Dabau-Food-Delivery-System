export const customerStats = [
  { label: "Active Orders", value: "1", change: "Arriving in 12 min", icon: "local_shipping" },
  { label: "Campus Vendors", value: "24", change: "8 open now", icon: "storefront" },
  { label: "Reward Points", value: "640", change: "Mock balance", icon: "stars" }
];

export const adminStats = [
  { label: "Total Users", value: "128", change: "Customers, riders, admins", icon: "group" },
  { label: "Active Restaurants", value: "21", change: "3 closed for prep", icon: "storefront" },
  { label: "Live Orders", value: "42", change: "9 pending assignment", icon: "receipt_long" },
  { label: "Available Riders", value: "18", change: "4 in transit", icon: "two_wheeler" }
];

export const riderStats = [
  { label: "Assigned Runs", value: "3", change: "2 priority drops", icon: "assignment" },
  { label: "Zone Score", value: "92%", change: "Preferred north route", icon: "explore" },
  { label: "Mock Earnings", value: "RM 76", change: "Today estimate", icon: "account_balance_wallet" }
];

export const restaurants = [
  {
    id: "REST-001",
    name: "Campus Cafe",
    cuisine: "Malay Food",
    category: "Malay Food",
    status: "Open",
    campusLocation: "Central Eatery",
    nodeId: "CENTRAL_EATERY",
    orders: 18,
    rating: 4.8
  },
  {
    id: "REST-002",
    name: "Engineering Bites",
    cuisine: "Western",
    category: "Western",
    status: "Open",
    campusLocation: "Engineering Quad",
    nodeId: "ENGINEERING_QUAD",
    orders: 11,
    rating: 4.6
  },
  {
    id: "REST-003",
    name: "Dabau Drinks Lab",
    cuisine: "Drinks",
    category: "Drinks",
    status: "Open",
    campusLocation: "Library Lobby",
    nodeId: "LIBRARY",
    orders: 7,
    rating: 4.7
  },
  {
    id: "REST-004",
    name: "Faculty Noodles",
    cuisine: "Cafe",
    category: "Cafe",
    status: "Closed",
    campusLocation: "FSKTM Block A",
    nodeId: "FSKTM_BLOCK_A",
    orders: 0,
    rating: 4.4
  }
];

export const menuItems = [
  { name: "Nasi Lemak Campus Set", vendor: "Campus Cafe", price: "RM 8.90", tag: "Popular", tone: "green" },
  { name: "Hainanese Chicken Chop", vendor: "Engineering Bites", price: "RM 12.50", tag: "Lunch", tone: "amber" },
  { name: "Mee Goreng Mamak", vendor: "Faculty Noodles", price: "RM 7.50", tag: "Spicy", tone: "red" },
  { name: "Iced Latte", vendor: "Dabau Drinks Lab", price: "RM 6.90", tag: "Drinks", tone: "blue" },
  { name: "Sweet Sour Chicken Rice", vendor: "Campus Cafe", price: "RM 10.90", tag: "Combo", tone: "orange" },
  { name: "Beef Burger Set", vendor: "Engineering Bites", price: "RM 13.90", tag: "Western", tone: "slate" }
];

export const cartItems = [
  { id: "CART-001", name: "Nasi Lemak Campus Set", qty: 1, price: 8.9, note: "Less sambal" },
  { id: "CART-002", name: "Iced Latte", qty: 2, price: 6.9, note: "No sugar" }
];

export const activeOrder = {
  id: "UMD-84729",
  vendor: "Campus Cafe",
  destination: "Engineering Block C, Room 304",
  eta: "12 min",
  rider: "Rafiq Lim",
  status: "Out for Delivery"
};

export const trackingSteps = [
  { label: "Order Placed", time: "12:10 PM", done: true },
  { label: "Preparing Meal", time: "12:18 PM", done: true },
  { label: "Out for Delivery", time: "12:32 PM", done: true, active: true },
  { label: "Delivered", time: "Pending", done: false }
];

export const riderAssignments = [
  { id: "UMD-84729", pickup: "Campus Cafe", dropoff: "Engineering Block C", eta: "12 min", distance: "1.2 km", priority: "High" },
  { id: "UMD-84731", pickup: "Dabau Drinks Lab", dropoff: "Library Lobby", eta: "19 min", distance: "1.8 km", priority: "Normal" },
  { id: "UMD-84740", pickup: "Engineering Bites", dropoff: "Residential College A", eta: "26 min", distance: "2.4 km", priority: "Normal" }
];

export const zones = [
  { name: "North Academic Zone", load: "High", riders: 6, eta: "14 min" },
  { name: "Library Loop", load: "Medium", riders: 4, eta: "18 min" },
  { name: "Residential South", load: "Low", riders: 3, eta: "22 min" }
];

export const users = [
  {
    id: "USR-001",
    name: "Aina Rahman",
    email: "aina.rahman@student.um.edu.my",
    role: "Customer",
    status: "Active",
    availability: "",
    currentNode: "",
    lastSeen: "2 min ago"
  },
  {
    id: "USR-002",
    name: "Rafiq Lim",
    email: "rafiq.lim@rider.umdabau.local",
    role: "Rider",
    status: "Active",
    availability: "Available",
    currentNode: "FSKTM_BLOCK_A",
    lastSeen: "Live"
  },
  {
    id: "USR-003",
    name: "Mei Yee",
    email: "mei.yee@rider.umdabau.local",
    role: "Rider",
    status: "Offline",
    availability: "Unavailable",
    currentNode: "KK12",
    lastSeen: "18 min ago"
  },
  {
    id: "USR-004",
    name: "Vincent Admin",
    email: "vincent.admin@umdabau.local",
    role: "Admin",
    status: "Active",
    availability: "",
    currentNode: "",
    lastSeen: "Now"
  }
];

export const liveOrders = [
  { id: "UMD-84729", customer: "Aina Rahman", vendor: "Campus Cafe", rider: "Rafiq Lim", status: "In Transit", total: "RM 22.70" },
  { id: "UMD-84731", customer: "Daniel Tan", vendor: "Dabau Drinks Lab", rider: "Mei Yee", status: "Preparing", total: "RM 13.80" },
  { id: "UMD-84735", customer: "Priya Nair", vendor: "Faculty Noodles", rider: "Unassigned", status: "Pending", total: "RM 9.50" },
  { id: "UMD-84740", customer: "Jason Wong", vendor: "Engineering Bites", rider: "Amir Zakwan", status: "Delivered", total: "RM 16.90" }
];

export const alerts = [
  { title: "High order volume", body: "North Academic Zone is above normal lunch traffic.", level: "warning" },
  { title: "Vendor paused", body: "Faculty Noodles is temporarily unavailable.", level: "info" },
  { title: "Rider reassigned", body: "UMD-84735 needs manual assignment review.", level: "danger" }
];

export const mapMarkers = [
  { label: "Campus Cafe", type: "vendor", x: 22, y: 35 },
  { label: "Rider Rafiq", type: "rider", x: 52, y: 48 },
  { label: "Engineering Block C", type: "dropoff", x: 74, y: 66 }
];
