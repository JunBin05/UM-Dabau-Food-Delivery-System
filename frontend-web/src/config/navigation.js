export const roles = [
  {
    id: "customer",
    label: "Customer",
    homePage: "customer-dashboard",
    description: "Order meals, browse vendors, and follow campus delivery.",
    icon: "person"
  },
  {
    id: "rider",
    label: "Rider",
    homePage: "rider-dashboard",
    description: "Review assignments, zones, and live route status.",
    icon: "two_wheeler"
  },
  {
    id: "admin",
    label: "Admin",
    homePage: "admin-dashboard",
    description: "Monitor users, restaurants, orders, and operations.",
    icon: "admin_panel_settings"
  }
];

export const roleMeta = {
  customer: {
    label: "Customer",
    badge: "Student",
    profileName: "Aina Rahman",
    search: "Search orders, menus..."
  },
  rider: {
    label: "Rider",
    badge: "Courier",
    profileName: "Rafiq Lim",
    search: "Search deliveries, zones..."
  },
  admin: {
    label: "Admin",
    badge: "Operations",
    profileName: "Vincent Admin",
    search: "Search orders, users..."
  }
};

export const navigationByRole = {
  customer: [
    { id: "customer-dashboard", label: "Customer Dashboard", icon: "dashboard" },
    { id: "browse-menu", label: "Browse Menu", icon: "restaurant" },
    { id: "cart", label: "Cart", icon: "shopping_cart" },
    { id: "order-tracking", label: "Order Tracking", icon: "local_shipping" },
    { id: "map-tracker", label: "Map Tracker", icon: "map" },
    { id: "logout", label: "Logout", icon: "logout", danger: true }
  ],
  rider: [
    { id: "rider-dashboard", label: "Rider Dashboard", icon: "dashboard" },
    { id: "assigned-delivery", label: "Assigned Delivery", icon: "assignment" },
    { id: "preferred-zones", label: "Preferred Zones", icon: "explore" },
    { id: "map-tracker", label: "Map Tracker", icon: "map" },
    { id: "logout", label: "Logout", icon: "logout", danger: true }
  ],
  admin: [
    { id: "admin-dashboard", label: "Admin Dashboard", icon: "dashboard" },
    { id: "user-management", label: "User Management", icon: "group" },
    { id: "restaurant-management", label: "Restaurant Management", icon: "storefront" },
    { id: "live-map", label: "Live Map", icon: "map" },
    { id: "order-monitoring", label: "Order Monitoring", icon: "monitor_heart" },
    { id: "dev-mode", label: "Dev Mode", icon: "developer_mode" },
    { id: "logout", label: "Logout", icon: "logout", danger: true }
  ]
};

export const pageTitles = {
  "customer-dashboard": "Customer Dashboard",
  "browse-menu": "Browse Menu",
  cart: "Cart Preview",
  "order-tracking": "Order Tracking",
  "map-tracker": "Map Tracker",
  "rider-dashboard": "Rider Dashboard",
  "assigned-delivery": "Assigned Delivery",
  "preferred-zones": "Preferred Zones",
  "admin-dashboard": "Admin Dashboard",
  "user-management": "User Management",
  "restaurant-management": "Restaurant Management",
  "live-map": "Live Map",
  "order-monitoring": "Order Monitoring",
  "dev-mode": "Dev Mode Spoofer"
};
