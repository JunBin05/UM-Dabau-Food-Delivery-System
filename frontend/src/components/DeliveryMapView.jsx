import React, { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const DRIVER_STEP_MS = 1400;

const markerIcons = {
  driver: L.divIcon({
    className: "delivery-map-marker driver-marker",
    html: '<span class="material-symbols-outlined">two_wheeler</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  cafe: L.divIcon({
    className: "delivery-map-marker cafe-marker",
    html: '<span class="material-symbols-outlined">restaurant</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  user: L.divIcon({
    className: "delivery-map-marker user-marker",
    html: '<span class="material-symbols-outlined">person_pin_circle</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  location: L.divIcon({
    className: "delivery-map-marker location-marker",
    html: '<span class="material-symbols-outlined">location_on</span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  })
};

function hasCoordinates(node) {
  const latitude = Number(node?.latitude);
  const longitude = Number(node?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0);
}

function positionFor(node) {
  return [Number(node.latitude), Number(node.longitude)];
}

export default function DeliveryMapView({
  activeRiders = [],
  center = [3.1209, 101.6521],
  className = "",
  dropoffNode = null,
  dropoffNodeId = "",
  emptyAction = null,
  emptyMessage = "",
  emptyTitle = "",
  height = "100%",
  locations = [],
  pickupNode = null,
  pickupNodeId = "",
  riderNode = null,
  riderName = "",
  routeDriverIndex = 0,
  routeSummary = null,
  showLocationsWhenNoRoute = true
}) {
  const path = routeSummary?.path || [];
  const routePositions = useMemo(
    () => path.filter(hasCoordinates).map(positionFor),
    [path]
  );
  const finalIndex = Math.max(path.length - 1, 0);
  const safeDriverIndex = Math.min(Math.max(routeDriverIndex, 0), finalIndex);
  const routeStart = hasCoordinates(path[safeDriverIndex]) ? path[safeDriverIndex] : null;
  const routePickup = path.find((node) => node.nodeId === pickupNodeId && hasCoordinates(node))
    || path.find((node) => hasCoordinates(node) && (node.nodeId?.includes("CAFE") || node.nodeId?.includes("FOOD") || node.nodeId?.includes("CENTRAL") || node.nodeId?.includes("ZUS")));
  const routeEnd = path.find((node) => node.nodeId === dropoffNodeId && hasCoordinates(node))
    || [...path].reverse().find(hasCoordinates);
  const visibleRiderNode = routeStart || (hasCoordinates(riderNode) ? riderNode : null);
  const visiblePickupNode = routePickup || (hasCoordinates(pickupNode) ? pickupNode : null);
  const visibleDropoffNode = routeEnd || (hasCoordinates(dropoffNode) ? dropoffNode : null);
  const mapCenter = visibleRiderNode
    ? positionFor(visibleRiderNode)
    : visiblePickupNode
      ? positionFor(visiblePickupNode)
      : visibleDropoffNode
        ? positionFor(visibleDropoffNode)
        : center;
  const hasRoute = Boolean(routeSummary && routePositions.length > 1);
  const mapKey = routeSummary?.orderId || visiblePickupNode?.nodeId || visibleDropoffNode?.nodeId || "campus-map";

  return (
    <div className={`delivery-map-view ${className}`.trim()} style={{ height }}>
      <MapContainer key={mapKey} center={mapCenter} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {!hasRoute && showLocationsWhenNoRoute && locations.filter(hasCoordinates).map((location) => (
          <Marker key={location.id || location.nodeId} icon={markerIcons.location} position={positionFor(location)}>
            <Popup>
              <strong>{location.name}</strong><br />
              <small style={{ color: "gray" }}>{location.nodeId}</small>
            </Popup>
          </Marker>
        ))}
        {!hasRoute && activeRiders.filter(hasCoordinates).map((rider) => (
          <Marker key={rider.userId} icon={markerIcons.driver} position={positionFor(rider)}>
            <Popup>
              <strong>{rider.fullName}</strong><br />
              <small>{rider.currentNodeId} - active in RiderHeap</small>
            </Popup>
          </Marker>
        ))}
        {routePositions.length > 1 && <Polyline positions={routePositions} pathOptions={{ color: "#16a34a", weight: 6, opacity: 0.86 }} />}
        {visibleRiderNode && (
          <Marker icon={markerIcons.driver} position={positionFor(visibleRiderNode)}>
            <Popup><strong>Driver</strong><br /><small>{riderName || visibleRiderNode.name}</small></Popup>
          </Marker>
        )}
        {visiblePickupNode && (
          <Marker icon={markerIcons.cafe} position={positionFor(visiblePickupNode)}>
            <Popup><strong>Cafe pickup</strong><br /><small>{visiblePickupNode.name}</small></Popup>
          </Marker>
        )}
        {visibleDropoffNode && (
          <Marker icon={markerIcons.user} position={positionFor(visibleDropoffNode)}>
            <Popup><strong>User location</strong><br /><small>{visibleDropoffNode.name}</small></Popup>
          </Marker>
        )}
      </MapContainer>

      {!hasRoute && (emptyTitle || emptyMessage) && (
        <div className="delivery-map-empty-state">
          <strong>{emptyTitle}</strong>
          {emptyMessage && <span>{emptyMessage}</span>}
          {emptyAction}
        </div>
      )}
    </div>
  );
}
