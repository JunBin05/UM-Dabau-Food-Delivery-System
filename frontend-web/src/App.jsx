import React, { useEffect, useState } from "react";
import AppShell from "./components/AppShell.jsx";
import { navigationByRole, roles } from "./config/navigation.js";
import { cartItems as initialCartItems } from "./data/mockData.js";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BrowseMenu from "./pages/BrowseMenu.jsx";
import CartPreview from "./pages/CartPreview.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import DevModeSpoofer from "./pages/DevModeSpoofer.jsx";
import LiveMap from "./pages/LiveMap.jsx";
import LoginRoleSelection from "./pages/LoginRoleSelection.jsx";
import OrderMonitoring from "./pages/OrderMonitoring.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import RestaurantManagement from "./pages/RestaurantManagement.jsx";
import RiderDashboard from "./pages/RiderDashboard.jsx";
import UserManagement from "./pages/UserManagement.jsx";

const routeByPath = {
  "/admin/users": { role: "admin", page: "user-management" },
  "/admin/restaurants": { role: "admin", page: "restaurant-management" }
};

function getHomePage(roleId) {
  return roles.find((role) => role.id === roleId)?.homePage ?? "customer-dashboard";
}

function isValidRole(roleId) {
  return roles.some((role) => role.id === roleId);
}

function getAllowedPages(roleId) {
  return (navigationByRole[roleId] ?? []).filter((item) => item.id !== "logout").map((item) => item.id);
}

export default function App() {
  const [role, setRole] = usePersistentState("um-dabau-role", "");
  const [currentPage, setCurrentPage] = usePersistentState("um-dabau-page", "customer-dashboard");
  const [cartItems, setCartItems] = useState(() => initialCartItems);
  const directRoute = routeByPath[window.location.pathname];
  const activeRole = directRoute?.role ?? role;
  const activePage = directRoute?.page ?? currentPage;

  function selectRole(nextRole) {
    setRole(nextRole);
    setCurrentPage(getHomePage(nextRole));
  }

  function logout() {
    setRole("");
    setCurrentPage("customer-dashboard");
  }

  function addToCart(menuItem) {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.id === menuItem.id);

      if (existingItem) {
        return current.map((item) => item.id === menuItem.id ? { ...item, qty: item.qty + 1 } : item);
      }

      return [
        ...current,
        {
          id: menuItem.id,
          name: menuItem.name,
          qty: 1,
          price: menuItem.priceValue,
          note: menuItem.vendor
        }
      ];
    });
  }

  useEffect(() => {
    if (directRoute) {
      return;
    }

    if (!role) {
      return;
    }

    if (!isValidRole(role)) {
      setRole("");
      setCurrentPage("customer-dashboard");
      return;
    }

    const allowedPages = getAllowedPages(role);
    if (!allowedPages.includes(currentPage)) {
      setCurrentPage(getHomePage(role));
    }
  }, [currentPage, directRoute, role, setCurrentPage, setRole]);

  if (!activeRole || !isValidRole(activeRole)) {
    return <LoginRoleSelection onSelectRole={selectRole} />;
  }

  const allowedPages = getAllowedPages(activeRole);
  const safePage = allowedPages.includes(activePage) ? activePage : getHomePage(activeRole);

  return (
    <AppShell role={activeRole} currentPage={safePage} onNavigate={setCurrentPage} onLogout={logout}>
      {renderPage(safePage, activeRole, setCurrentPage, selectRole, cartItems, setCartItems, addToCart)}
    </AppShell>
  );
}

function renderPage(page, role, onNavigate, onSelectRole, cartItems, setCartItems, addToCart) {
  switch (page) {
    case "customer-dashboard":
      return <CustomerDashboard onNavigate={onNavigate} cartItems={cartItems} />;
    case "browse-menu":
      return <BrowseMenu onAddToCart={addToCart} cartCount={cartItems.reduce((total, item) => total + item.qty, 0)} />;
    case "cart":
      return <CartPreview items={cartItems} setItems={setCartItems} />;
    case "order-tracking":
      return <OrderTracking />;
    case "rider-dashboard":
      return <RiderDashboard view="riderMain" />;
    case "assigned-delivery":
      return <RiderDashboard view="riderAssigned" />;
    case "preferred-zones":
      return <RiderDashboard view="riderZones" />;
    case "admin-dashboard":
      return <AdminDashboard onNavigate={onNavigate} />;
    case "user-management":
      return <UserManagement />;
    case "restaurant-management":
      return <RestaurantManagement />;
    case "order-monitoring":
      return <OrderMonitoring />;
    case "live-map":
    case "map-tracker":
      return <LiveMap role={role} />;
    case "dev-mode":
      return <DevModeSpoofer role={role} onSelectRole={onSelectRole} />;
    default:
      return role === "admin" ? <AdminDashboard onNavigate={onNavigate} /> : <CustomerDashboard onNavigate={onNavigate} />;
  }
}

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => localStorage.getItem(key) || initialValue);

  useEffect(() => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);

  return [value, setValue];
}
