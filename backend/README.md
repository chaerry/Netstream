# Netstream Telecom Inventory Service (Quarkus Backend)

High-performance REST API services implementing the **VC4 S2C Inventory Management Model** using Java 21, Quarkus 3.15, Hibernate ORM with Panache, PostgreSQL, and Keycloak OIDC Authentication.

## Modules Implemented (Section 1 of Proposal)
- **1.1 Physical Inventory**: Network devices (Routers, Switches, DWDM Chassis, OLTs), chassis ports (10G/100G LC/UPC fiber), server racks (42U), and location bindings.
- **1.2 Logical & Virtual Inventory**: Virtual Network Elements (VNE/VNF, vRouters, vFirewalls), VLAN IDs (1-4094), VRFs, and resource allocations.
- **1.3 Service Inventory**: End-to-end customer telecom services (L2/L3 VPN, Internet Direct, Dark Fiber), SLA tiers, and topological hop-by-hop resource mappings.
- **1.4 - 1.6 Planning, Capacity & Network Cost**: Automated path cost calculation rules (lowest cost, fewest hops, shortest path) and rack/power capacity forecasting.
- **1.7 Network Location Management**: Complete digital twin hierarchy from Country down to Room and Rack.

## Configuration Parameters
- **Database**: PostgreSQL at `jdbc:postgresql://145.79.8.141:5433/netstream` (User: `n8n`)
- **Keycloak OIDC Realm**: `https://keycloak.aitiserve.co.id:8095/realms/aitiserve` (Client: `itsm_gaharu`)
- **HTTP Port**: `8071`
- **Swagger UI**: `http://localhost:8071/swagger-ui`

## Running Locally

```bash
# 1. Initialize Database Schema & Seed Data (Optional)
psql -h 145.79.8.141 -p 5433 -U n8n -d netstream -f src/main/resources/db/schema.sql
psql -h 145.79.8.141 -p 5433 -U n8n -d netstream -f src/main/resources/db/seed.sql

# 2. Start Quarkus Dev Server
./mvnw quarkus:dev
```
