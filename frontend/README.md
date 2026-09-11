# Netstream Telecom Inventory Frontend (Vite + React + TypeScript)

High-tech, futuristic Network Operations Center (NOC) UI for the **Netstream Telecom Inventory Platform (VC4 S2C Model)**.

## Key Features & UI Modules
- **1.1 Physical Hardware & Racks**:
  - Full search, filter, and pagination for core network chassis, routers, switches, and DWDM nodes.
  - Interactive **42U Graphical Elevation Visualizer** showing occupied units, power draw wattage, and weight gauges.
  - **Port Interface Inspector** for 100GE / 10GE optical fiber connections and operational states.
  - Add Hardware modal dialog with input validation.
- **1.2 Logical & Virtual Inventory (NFV / VNF)**:
  - Virtual Network Elements (vRouters, vFirewalls, vEPC) with vCPU, RAM, and Disk resource pools.
  - VLAN allocation & VRF routing domain tracking.
- **1.3 Service Inventory & Resource Mapping**:
  - Customer telecom service catalogue (MPLS L3VPN, Dedicated Internet Access, Dark Fiber).
  - **Topological End-to-End Hop-by-Hop Visualizer** showing A-End to Z-End circuit links with real-time bandwidth allocations.
  - Service lifecycle management (Provisioning, Active, Suspended, Terminated).
- **1.4 Planning & Cost Engine**:
  - Automated routing rule calculations (Lowest Cost vs Fewest Hops vs Shortest Latency).
  - Site-level capacity and power consumption forecasting.
- **1.7 Location Digital Twin**:
  - Interactive drill-down from Country -> Cities -> Sites -> Core Server Rooms -> Racks.
- **Modules 2–8 Placeholders**:
  - Rich blueprint pages for GIS, Leased Line, IPAM, Telephone Number, Integration, Reporting, and Impact Analysis.
- **Keycloak IAM Integration & RBAC Sandbox**:
  - Keycloak PKCE login integration with `itsm_gaharu` client.
  - Instant RBAC sandbox switcher on header (`Admin`, `Operator`, `Viewer`) for rapid role testing.

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run local Vite dev server
npm run dev
```

Application will run at `http://localhost:5173`.
