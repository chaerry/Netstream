# Netstream Telecom Inventory Platform (VC4 S2C Model)

[![Quarkus 3.15](https://img.shields.io/badge/Quarkus-3.15.0-blue.svg)](https://quarkus.io/)
[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS 3](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)

A modern, production-grade **Telecom Operations Support System (OSS) & Network Inventory Platform** implementing the **VC4 S2C Model** for physical, logical, optical fiber, IPAM, telephony, and spatial GIS management.

---

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │          Keycloak OIDC Server           │
                      │    (RBAC: Admin, Planner, Engineer)     │
                      └────────────────────┬────────────────────┘
                                           │ Bearer Token / JWT
                                           ▼
┌─────────────────────────┐     REST API (JSON)      ┌─────────────────────────┐
│     Frontend (SPA)      │ ◄──────────────────────► │   Backend Microservice  │
│  React 18 + TypeScript  │      Port 8070/8071      │    Java 21 + Quarkus    │
│  Vite + Tailwind + GIS  │                          │  Hibernate ORM Panache  │
└─────────────────────────┘                          └────────────┬────────────┘
                                                                  │ JDBC
                                                                  ▼
                                                     ┌─────────────────────────┐
                                                     │  PostgreSQL 15 Database │
                                                     │  Multi-Schema Inventory │
                                                     └─────────────────────────┘
```

---

## Implemented Modules

### 1. Physical & Logical Inventory Management
- **Location Hierarchy**: Granular topology modeling from Regions down to Datacenters, OLT Shelters, POPs, Floors, and Equipment Rooms.
- **Interactive 42U Rack Elevations**: Visual slot occupancy, front/rear mounting, power budgeting, and real-time device status indicators.
- **Network Devices & Port Inspector**: Chassis, line cards, and port allocations with SFP/XFP module inspection, link speeds, and transceiver metrics.
- **Virtual Network Elements (VNE)**: Logical overlays including VLANs, VRFs, VXLAN VNIs, and MPLS L2/L3 VPN instances.
- **End-to-End Service Hop Visualizer**: VC4 circuit routing engine visualizing physical and logical hops from A-End origin to Z-End destination.
- **Planning & Cost Estimator**: Automated CAPEX/OPEX cost planning based on port utilization and equipment costs.

### 2. Optical Cables & Core Infrastructure
- **Fiber Cable Lifecycle**: Support for Trunk, Feeder, Distribution, and Drop optical cables with spatial geometry and installation tracking.
- **Cable Strand Matrix**: Interactive core strand matrix modal showing strand states (Available, Connected, Reserved, Damaged), attenuation (dB), and splices.
- **Endpoint Tracing**: Dynamic tracking of A-End and Z-End terminations across ODFs, patch panels, and optical closures.

### 3. Leased Line Management (VC4 S2C Model)
- **360° Circuit Register**: Symmetrical, dedicated circuits across **Inbound (Off-Net / Rented Tails)** and **Outbound (On-Net / Retail & Wholesale Enterprise Lines)** with default currency standard in **USD ($)**.
- **Multi-Technology Spectrum**: Native support for EPL (Ethernet Private Line), EVPL, DIA (Dedicated Internet Access), Dark Fiber pairs, and 100G+ DWDM Lambda wavelengths.
- **Physical & Logical Resource Mapping**: End-to-end circuit hop visualizer connecting origin POP/rack/SFP port ➔ optical fiber strands ➔ logical VNE/VRF overlays ➔ destination port/POP.
- **Commercial Contract & Carrier Directory**: Centralized management of carrier MSAs, Service Orders, renewal notice periods, and monthly OpEx commitments.
- **Automated 3-Way Invoice Reconciliation**: Mathematical audit comparing vendor billed MRC against contracted rates minus SLA downtime penalty credits, flagging overbilling and charges for cancelled circuits.
- **OpEx Capacity & Decommissioning Engine**: Continuous background analysis identifying dormant/idle circuits with &lt;1% traffic or 0 active subscriber services, with direct 1-click dispatch to **Gaharu_BPMN_NGIN** for carrier cancellation.
- **SLA Availability & Rebate Calculator**: Uptime compliance tracking (99.999% Platinum, 99.99% Gold) with automated pro-rata and multiplier penalty rebate calculations for MTTR breaches.

### 4. IP Address Management (IPAM)
- **Hierarchical Subnet Tree**: Unified IPv4 and IPv6 supernet-to-subnet allocation trees.
- **Subnet Calculator**: Real-time computation of network IDs, broadcast addresses, usable ranges, wildcard masks, and CIDR prefixes.
- **IP Address Register**: Status tracking for Allocated, Static, Reserved, DHCP, and Available IPs with customer and device associations.
- **Multi-Tenant VRF Isolation**: Domain segregation using Route Targets (RT) and Route Distinguishers (RD).
- **Live Network Discovery**: ARP/ICMP ping sweeps to detect active hosts, latency, and rogue uncataloged addresses.
- **Batch IP Bulkloader**: High-speed CSV and formatted text importer with instant syntax validation.

### 5. Telephone Number Management
- **PSTN & DID/DDI Catalog**: Hierarchical management of country codes, area codes, prefixes, and allocated number blocks.
- **E.164 Number Range Visualizer**: Matrix grid for inspecting active, reserved, quarantined, and ported telephone numbers.
- **Local & Mobile Number Portability (LNP/MNP)**: Port-in and Port-out inter-carrier migration workflows with authorization tracking.
- **IMS & Softswitch Auto-Discovery**: Live SIP trunk and registration reconciliation against IMS core softswitches.
- **Regulatory Compliance**: Automated number cooling-off timers, aging quarantine periods, and conservation enforcement.

### 6. GIS & Telecom Spatial Map Management
- **Interactive Map Engine**: High-performance geospatial visualization powered by Leaflet and MarkerCluster.
- **Multi-Corridor Management**: Pre-configured corridors (Trans-Java Backbone, Jakarta Metro, Bandung Aggregation, Surabaya Metro) plus an interactive **Corridor Manager** to define custom domestic or international regional corridors.
- **Spatial Cable & POP Rendering**: Color-coded cable classification (Trunk, Feeder, Distribution), clickable node inspectors, and strand drawers.
- **OTDR Cut & Fault Locator**: Point-and-click optical time-domain reflectometer fault simulator calculating fiber cut coordinates from source ODFs.
- **Spatial Bill of Materials (BOM) Planner**: Instant calculation of required cable lengths, slack loops, splice enclosures, and patch cords based on map coordinates.
- **Omnisearch Auto-complete**: Quick-jump search indexing cables, POPs, splices, and manholes across the active map view.

### 7. Integration & Automation Engine (Multi-Vendor NMS/EMS & Northbound APIs)
- **Southbound Mediation Hub**: High-speed connector abstraction supporting Huawei iMaster NCE, Cisco EPN-M/DNA-C, Nokia NSP, ZTE ZENIC ONE, and Generic SNMPv3.
- **Automated 3-Way Reconciliation**: Continuous diff detection comparing Live Discovered Network State against the Netstream SSoT Inventory with 1-click sync, rogue asset flagging, or BPMN dispatch.
- **Universal Change Data Capture (CDC)**: Immutable chronological audit ledger recording every configuration modification with JSON before/after snapshots.
- **Telecom-Enriched Alarms**: Real-time alarm stream enriched with physical device, 42U rack, optical cable strand, leased line circuit, impacted corporate customers, and revenue risk.
- **Northbound TM Forum Open APIs**: Standards-aligned REST implementations for **TMF638** (Service Inventory), **TMF639** (Resource Inventory), and **TMF642** (Alarm Management).
- **Gaharu_BPMN_NGIN Bridge**: Direct workflow dispatch for field optical inspections, trouble ticketing, and automated service provisioning.

---

## Directory Structure

```
Netstream/
├── backend/                             # Java 21 Quarkus 3.15 Microservice
│   ├── pom.xml                          # Maven build descriptors
│   ├── src/main/resources/
│   │   ├── application.properties.example # Masked template configuration
│   │   └── db/
│   │       ├── schema.sql               # Core inventory DDL (Devices, Cables, Services)
│   │       ├── ipam_and_telephony_schema.sql # IPAM & Telephone DDL
│   │       ├── leased_line_schema.sql   # Leased Line DDL (Contracts, Circuits, Invoices, SLA, Gaharu BPMN)
│   │       ├── integration_schema.sql   # Integration DDL (Connectors, Reconciliation, CDC, Alarms, Webhooks)
│   │       ├── seed.sql                 # Topology & device seed data
│   │       └── seed_devices.py          # Synthetic device generation script
│   └── src/main/java/id/co/netstream/
│       ├── inventory/                   # Core Inventory Domain (Devices, Ports, Racks, Cables, Circuits)
│       └── integration/                 # Option A Schema-Isolated Integration Engine
│           ├── controller/              # IntegrationResource, TmfOpenApiResource
│           ├── domain/                  # Entities & Enums in integration schema
│           ├── dto/                     # IntegrationDTOs (Connectors, Diff, Alarms, TMF)
│           ├── facade/                  # InventoryFacade (In-Memory Enrichment & SSoT Sync)
│           ├── repository/              # Panache Repositories
│           └── service/                 # IntegrationService (Reconciliation, CDC, Webhooks)
│
├── frontend/                            # Modern Vite + React 18 + TypeScript SPA
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env.example                     # Masked frontend environment template
│   └── src/
│       ├── auth/                        # Keycloak-js OIDC provider & auth guards
│       ├── api/                         # Axios client (integrationApi, leasedLineApi, etc.)
│       ├── components/
│       │   ├── common/                  # Modals, badges, futuristic dialogs, snail logo
│       │   ├── layout/                  # Cyber NOC AppLayout, Sidebar, Header
│       │   ├── inventory/               # 42U Rack elevation, hop visualizer, strand matrix
│       │   ├── leasedline/              # Leased line register, resource map, contracts, invoice audit, SLA
│       │   ├── integration/             # Connector hub, reconciliation diff, audit logs, alarm matrix, webhooks
│       │   ├── ipam/                    # Subnet calculator, IP register, bulkloader, VRFs
│       │   ├── telephony/               # Number blocks, range matrix, porting, IMS sync
│       │   └── gis/                     # Leaflet map, corridor manager, OTDR fault locator
│       ├── pages/                       # Module pages (Inventory, LeasedLine, Integration, IPAM, Telephony, GIS)
│       └── types/                       # Shared TypeScript domain models (integration.ts, leasedLine.ts, etc.)
│
├── config/
│   └── application.properties.example   # Masked system configuration template
├── documents/                           # Technical architecture & functional specifications
│   ├── integration_module_guide.md      # Comprehensive Integration Engine, TMF APIs & Gaharu BPMN Guide
│   ├── leased_line_module_guide.md      # Comprehensive Leased Line Architecture & Gaharu BPMN Guide
│   ├── gis_module_telecom_spatial_management.md
│   ├── optical_cable_and_core_infrastructure_management.md
│   ├── ip_management_and_telephone_number_modules.md
│   ├── vrf_and_vne_explanation.md
│   ├── gpon_and_passive_infrastructure_usecase.md
│   └── metro_ethernet_jakarta_surabaya_usecase.md
├── docker-compose.yml                   # Container orchestration stack
└── .gitignore                           # Git exclusion rules for artifacts & secrets
```

---

## Security & Configuration Setup

For security, live credentials are not committed to Git. Duplicate `.example` templates with masked credentials (`<username>`, `<password>`, `<url>`, `<client-id>`, `<secret>`) are provided.

### 1. Configure Backend Properties
Copy the example configuration to your local properties file:
```bash
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```
Update `application.properties` with your PostgreSQL connection details and Keycloak OIDC client secrets.

### 2. Configure Frontend Environment
Copy the example environment file:
```bash
cp frontend/.env.example frontend/.env
```
Ensure `VITE_API_BASE_URL` points to your active Quarkus instance and configure your Keycloak realm.

---

## Quick Start Guide

### Prerequisites
- **Java**: OpenJDK 21 or GraalVM 21+
- **Node.js**: Node 18.x or 20.x, npm 9+
- **Database**: PostgreSQL 15+ with PostGIS extension (optional for spatial queries)
- **Maven**: Maven 3.9+ (or use `./mvnw`)

### 1. Database Initialization
Execute the schema and seed scripts against your target PostgreSQL database:
```bash
psql -h <db-host> -p 5432 -U <db-user> -d netstream -f backend/src/main/resources/db/schema.sql
psql -h <db-host> -p 5432 -U <db-user> -d netstream -f backend/src/main/resources/db/ipam_and_telephony_schema.sql
psql -h <db-host> -p 5432 -U <db-user> -d netstream -f backend/src/main/resources/db/leased_line_schema.sql
psql -h <db-host> -p 5432 -U <db-user> -d netstream -f backend/src/main/resources/db/integration_schema.sql
psql -h <db-host> -p 5432 -U <db-user> -d netstream -f backend/src/main/resources/db/seed.sql
```

### 2. Run Backend REST Service
```bash
cd backend
./mvnw clean compile quarkus:dev
```
- **REST Endpoints**: `http://localhost:8070/api/v1`
- **Swagger / OpenAPI UI**: `http://localhost:8070/swagger-ui`
- **Health Checks**: `http://localhost:8070/q/health`

### 3. Run Frontend Web Portal
```bash
cd frontend
npm install
npm run dev
```
- **Web UI Portal**: `http://localhost:5173` (or `http://localhost:3000`)
- **Credentials**: Sign in using Keycloak credentials or activate development mock mode.

---

## Keycloak OIDC Role-Based Access Control (RBAC)

The platform enforces strict role-based access across all endpoints:

| Role | Permissions |
|:---|:---|
| `TELECOM_ADMIN` | Full administrative access, schema modifications, corridor deletion, device decommissioning |
| `TELECOM_PLANNER` | Create and modify services, subnets, telephone blocks, and spatial cables |
| `TELECOM_ENGINEER` | View topologies, manage port allocations, run OTDR diagnostics, and inspect strands |
| `TELECOM_VIEWER` | Read-only access to inventory elevations, GIS map, and telephone catalogs |

---

## Technical Documentation

Detailed functional guides and architecture deep-dives are available in the [`documents/`](file:///Users/chaerry/Development/antigravity/Netstream/documents) directory:
- [Integration & Automation Engine Technical Guide (VC4 S2C Model & Gaharu BPMN)](file:///Users/chaerry/Development/antigravity/Netstream/documents/integration_module_guide.md)
- [Leased Line Management Module Guide (VC4 S2C Model & Gaharu BPMN)](file:///Users/chaerry/Development/antigravity/Netstream/documents/leased_line_module_guide.md)
- [GIS Module Telecom Spatial Management](file:///Users/chaerry/Development/antigravity/Netstream/documents/gis_module_telecom_spatial_management.md)
- [Optical Cable & Core Infrastructure Management](file:///Users/chaerry/Development/antigravity/Netstream/documents/optical_cable_and_core_infrastructure_management.md)
- [IP Management & Telephone Number Modules](file:///Users/chaerry/Development/antigravity/Netstream/documents/ip_management_and_telephone_number_modules.md)
- [VRF & Virtual Network Elements (VNE) Explanation](file:///Users/chaerry/Development/antigravity/Netstream/documents/vrf_and_vne_explanation.md)
- [GPON & Passive Optical Infrastructure Use Case](file:///Users/chaerry/Development/antigravity/Netstream/documents/gpon_and_passive_infrastructure_usecase.md)
- [Metro Ethernet Jakarta-Surabaya Use Case](file:///Users/chaerry/Development/antigravity/Netstream/documents/metro_ethernet_jakarta_surabaya_usecase.md)
