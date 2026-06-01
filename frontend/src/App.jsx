import React, { useCallback, useEffect, useState } from "react";
import AppShell from "./components/AppShell.jsx";
import { navigationByRole, roles } from "./config/navigation.js";
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

const browseCategories = ["All Items", "Malay", "Chinese", "Western", "Drinks", "Snacks", "Vegetarian", "More Filters"];
const ordersApiUrl = "http://localhost:8080/api/orders";

function getHomePage(roleId) {
  return roles.find((role) => role.id === roleId)?.homePage ?? "customer-dashboard";
}

function isValidRole(roleId) {
  return roles.some((role) => role.id === roleId);
}

function getAllowedPages(roleId) {
  const pages = (navigationByRole[roleId] ?? []).filter((item) => item.id !== "logout").map((item) => item.id);
  return roleId === "customer" ? [...pages, "map-tracker"] : pages;
}

function getValidBrowseCategory(category) {
  return browseCategories.includes(category) ? category : "All Items";
}

function updateBrowseCategoryQuery(category) {
  const nextUrl = category && category !== "All Items"
    ? `${window.location.pathname}?category=${encodeURIComponent(category)}`
    : window.location.pathname;
  window.history.replaceState(null, "", nextUrl);
}

function getCartItemId(item, fallbackIndex = 0) {
  return item.itemId || item.id || `${item.name || "cart-item"}-${fallbackIndex}`;
}

function toCartLineItem(item, fallbackIndex = 0) {
  return {
    id: getCartItemId(item, fallbackIndex),
    itemId: item.itemId || item.id,
    restaurantId: item.restaurantId,
    name: item.name,
    qty: item.qty || 1,
    price: Number(item.price ?? item.priceValue ?? 0),
    note: item.category || item.note || item.vendor || item.restaurantId || "Cart item",
    category: item.category,
    imageUrl: item.imageUrl
  };
}

function toMenuItemPayload(item) {
  return {
    itemId: item.itemId || item.id,
    restaurantId: item.restaurantId,
    name: item.name,
    price: Number(item.price ?? item.priceValue ?? 0),
    category: item.category || item.note || "",
    imageUrl: item.imageUrl || ""
  };
}

function normalizeCartItems(items) {
  return items.reduce((groupedItems, item, index) => {
    const lineItem = toCartLineItem(item, index);
    const existingItem = groupedItems.find((current) => current.id === lineItem.id);

    if (existingItem) {
      existingItem.qty += lineItem.qty;
      return groupedItems;
    }

    groupedItems.push(lineItem);
    return groupedItems;
  }, []);
}

export default function App() {
  const [role, setRole] = usePersistentState("um-dabau-role", "");
  const [currentPage, setCurrentPage] = usePersistentState("um-dabau-page", "customer-dashboard");
  const [browseCategory, setBrowseCategory] = useState(() => getValidBrowseCategory(new URLSearchParams(window.location.search).get("category")));
  const [cartItems, setCartItems] = useState([]);
  const [isUndoAvailable, setIsUndoAvailable] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const directRoute = routeByPath[window.location.pathname];
  const activeRole = directRoute?.role ?? role;
  const activePage = directRoute?.page ?? currentPage;

  const refreshCartItems = useCallback(() => {
    setIsCartLoading(true);

    const cartRequest = fetch(`${ordersApiUrl}/cart`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      });
    const undoRequest = fetch(`${ordersApiUrl}/cart/undo-available`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      });

    return Promise.all([cartRequest, undoRequest.catch(() => ({ undoAvailable: false }))])
      .then(([items, undoState]) => {
        const normalizedItems = normalizeCartItems(items);
        setCartItems(normalizedItems);
        setIsUndoAvailable(Boolean(undoState?.undoAvailable) || normalizedItems.length > 0);
      })
      .catch((error) => {
        console.error("Failed to fetch cart items:", error);
        setIsUndoAvailable(false);
      })
      .finally(() => {
        setIsCartLoading(false);
      });
  }, []);

  function navigate(nextPage) {
    if (typeof nextPage === "object" && nextPage !== null) {
      setCurrentPage(nextPage.page);
      const nextCategory = getValidBrowseCategory(nextPage.category);
      setBrowseCategory(nextCategory);
      updateBrowseCategoryQuery(nextPage.page === "browse-menu" ? nextCategory : "All Items");
      return;
    }

    setCurrentPage(nextPage);

    if (nextPage === "browse-menu") {
      setBrowseCategory("All Items");
      updateBrowseCategoryQuery("All Items");
    } else {
      updateBrowseCategoryQuery("All Items");
    }
  }

  function selectRole(nextRole) {
    setRole(nextRole);
    setCurrentPage(getHomePage(nextRole));
  }

  function logout() {
    setRole("");
    setCurrentPage("customer-dashboard");
  }

  function addOptimisticCartItem(menuItem) {
    setCartItems((current) => {
      const nextItem = toCartLineItem(menuItem);
      const existingItem = current.find((item) => item.id === nextItem.id);

      if (existingItem) {
        return current.map((item) => item.id === nextItem.id ? { ...item, qty: item.qty + 1 } : item);
      }

      return [...current, nextItem];
    });
  }

  function removeOptimisticCartItem(menuItem) {
    setCartItems((current) => {
      const nextItem = toCartLineItem(menuItem);
      const existingItem = current.find((item) => item.id === nextItem.id);

      if (!existingItem) {
        return current;
      }

      if (existingItem.qty <= 1) {
        return current.filter((item) => item.id !== nextItem.id);
      }

      return current.map((item) => item.id === nextItem.id ? { ...item, qty: item.qty - 1 } : item);
    });
  }

  function removeAllOptimisticCartItems(menuItem) {
    setCartItems((current) => {
      const nextItem = toCartLineItem(menuItem);
      return current.filter((item) => item.id !== nextItem.id);
    });
  }

  function addCartItem(menuItem) {
    addOptimisticCartItem(menuItem);

    return fetch(`${ordersApiUrl}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(toMenuItemPayload(menuItem))
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.text();
      })
      .then((message) => {
        console.log("Backend received add-to-cart request:", message);
        return refreshCartItems().then(() => true);
      })
      .catch((error) => {
        console.error("Failed to add item to cart:", error);
        removeOptimisticCartItem(menuItem);
        return refreshCartItems().then(() => false);
      });
  }

  function removeCartItem(menuItem) {
    removeOptimisticCartItem(menuItem);

    return fetch(`${ordersApiUrl}/cart/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(toMenuItemPayload(menuItem))
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      })
      .then(() => refreshCartItems().then(() => true))
      .catch((error) => {
        console.error("Failed to reduce item quantity:", error);
        addOptimisticCartItem(menuItem);
        return refreshCartItems().then(() => false);
      });
  }

  function removeAllCartItems(menuItem) {
    removeAllOptimisticCartItems(menuItem);

    return fetch(`${ordersApiUrl}/cart/remove-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(toMenuItemPayload(menuItem))
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.text();
      })
      .then(() => refreshCartItems().then(() => true))
      .catch((error) => {
        console.error("Failed to remove item from cart:", error);
        return refreshCartItems().then(() => false);
      });
  }

  function undoLastCartItem() {
    return fetch(`${ordersApiUrl}/cart/undo`, {
      method: "POST"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      })
      .then((cartResult) => {
        if (Array.isArray(cartResult?.items)) {
          setCartItems(normalizeCartItems(cartResult.items));
          setIsUndoAvailable(Boolean(cartResult.undoAvailable));
          return true;
        }

        return refreshCartItems();
      })
      .catch((error) => {
        console.error("Failed to undo last cart action:", error);
        return refreshCartItems();
      });
  }

  useEffect(() => {
    if (activeRole === "customer") {
      refreshCartItems();
    }
  }, [activeRole, refreshCartItems]);

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
    <AppShell role={activeRole} currentPage={safePage} onNavigate={navigate} onLogout={logout}>
      {renderPage(safePage, activeRole, navigate, selectRole, cartItems, addCartItem, removeCartItem, removeAllCartItems, refreshCartItems, undoLastCartItem, isUndoAvailable, isCartLoading, browseCategory)}
    </AppShell>
  );
}

function renderPage(page, role, onNavigate, onSelectRole, cartItems, addCartItem, removeCartItem, removeAllCartItems, refreshCartItems, undoLastCartItem, isUndoAvailable, isCartLoading, browseCategory) {
  switch (page) {
    case "customer-dashboard":
      return <CustomerDashboard onNavigate={onNavigate} cartItems={cartItems} />;
    case "browse-menu":
      return <BrowseMenu initialCategory={browseCategory} cartItems={cartItems} onCartAdd={addCartItem} onCartRemove={removeCartItem} onNavigate={onNavigate} cartCount={cartItems.reduce((total, item) => total + item.qty, 0)} />;
    case "cart":
      return <CartPreview items={cartItems} isLoading={isCartLoading} undoAvailable={isUndoAvailable} onRefreshCart={refreshCartItems} onUndoLastCartItem={undoLastCartItem} onAddItem={addCartItem} onRemoveItem={removeCartItem} onRemoveAllItem={removeAllCartItems} onNavigate={onNavigate} />;
    case "order-tracking":
      return <OrderTracking onNavigate={onNavigate} />;
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
      return <LiveMap role={role} onNavigate={onNavigate} />;
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
