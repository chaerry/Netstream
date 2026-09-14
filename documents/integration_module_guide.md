# Integration & Automation Engine Technical Guide (VC4 S2C Model)

## 1. Architectural Overview & Domain Context

In telecommunications OSS/BSS operations, maintaining an accurate **Single Source of Truth (SSoT)** across physical, logical, optical, and service inventories requires seamless bidirectional communication with the active network (Southbound) and enterprise IT systems (Northbound).

The **Integration Module** operates as the central nervous system of Netstream, following the **Option A Modular Schema Separation** pattern:
- **Dedicated PostgreSQL Schema (`integration.*`)**: Isolates connectors, discovery logs, reconciliation diffs, CDC change history, real-time alarms, and webhook dispatches from core inventory tables.
- **Inventory Facade Pattern**: Provides ultra-low latency (<1 ms) in-memory topology enrichment for alarms and atomic ACID transactions for reconciliation sync, while keeping the module 100% microservice-ready.

```
                      ┌─────────────────────────────────────────────────────────┐
                      │             BSS / OSS / CRM / SERVICEDESK               │
                      │       (Billing, ServiceNow, CRM, Gaharu_BPMN_NGIN)      │
                      └────────────────────────────▲────────────────────────────┘
                                                   │
                         Northbound REST (TMF Open APIs: 638, 639, 642)
                         Outbound Webhook Dispatcher (HMAC-SHA256)
                                                   │
                                                   ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                NETSTREAM INTEGRATION & AUTOMATION CORE                            │
├──────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│            AUTOMATED RECONCILIATION              │            ENRICHED ALARMS & AUDIT             │
│  • 3-Way Diff: Live Discovered vs Inventory SSoT │  • Multi-Source Ingest (Syslog, Traps, REST)   │
│  • Discrepancy Classification & Severity         │  • Inventory Topology Enrichment (Port/Strand) │
│  • 1-Click Sync or Work Order Dispatch           │  • Change Data Capture (CDC) Immutable Log     │
└──────────────────────────────────────────────────┴────────────────────────────────────────────────┘
                                                   ▲
                                                   │
                         Southbound Protocols: SNMP v2c/v3, NETCONF/YANG,
                         RESTCONF, Huawei NCE, Nokia NSP, Cisco EPN-M, TL1
                                                   │
                                                   ▼
                      ┌─────────────────────────────────────────────────────────┐
                      │             HETEROGENEOUS MULTI-VENDOR NETWORK          │
                      │    (Routers, Switches, OLTs, DWDM, SDH, Optical Nodes)  │
                      └────────────────────────────▲────────────────────────────┘
```

---

## 2. Southbound Multi-Vendor Connectors & Protocols

Netstream supports standardized adapters for Tier-1 network element managers and direct hardware protocols:

| Vendor / Protocol | Adapter Type | Supported Operations | Typical Cadence |
|:---|:---|:---|:---:|
| **Huawei iMaster NCE / U2000** | REST / RESTCONF | Full chassis inventory, optical power, BGP sessions, VLAN tags | Every 30 mins |
| **Cisco EPN-M / DNA-C** | RESTCONF / NETCONF | ASR/NCS router chassis, 100G interfaces, CDP/LLDP neighbors | Every 30 mins |
| **Nokia NSP (SAM)** | REST / MTOSI | 1830 PSS DWDM transponders, coherent wavelengths, OTN cross-connects | Every 60 mins |
| **ZTE ZENIC ONE** | NETCONF / YANG | IP/MPLS aggregation routers, OLT PON interfaces | Every 60 mins |
| **Generic SNMP v2c/v3** | Telemetry Ingest | RFC 1213 MIB-II, IF-MIB (ifOperStatus, ifSpeed), ENTITY-MIB 4133 | Every 15 mins |
| **TL1 (Transaction Language 1)**| CLI / Serial | Legacy SDH STM-1/STM-4/STM-16 cross-connect status | On-demand |

---

## 3. Automated 3-Way Reconciliation Engine

Reconciliation compares the **Live Discovered State** against the **Netstream Inventory Database** to detect configuration drift and uncataloged changes:

### Discrepancy Taxonomy
1. **`NEW_DISCOVERED` (Shadow IT / Uncataloged Assets)**:
   - Example: A field technician installs an unrecorded 48-port leaf switch (`SBY-LEAF-SW-08`) or inserts an uncataloged SFP transceiver.
   - Severity: **CRITICAL** or **MAJOR**.
2. **`MISSING_IN_LIVE` (Ghost Assets)**:
   - Example: An asset is marked as active in inventory but is unreachable or missing on the live network.
   - Severity: **MAJOR**.
3. **`ATTRIBUTE_MISMATCH` (Metadata Drift)**:
   - Example: Optic part number swapped from 10km (`QSFP28-100G-LR4`) to 40km (`QSFP28-100G-ER4`), or VLAN name normalized.
   - Severity: **MINOR** or **INFO** (Auto-approvable per policy).
4. **`STATE_DRIFT` (Operational vs Administrative Mismatch)**:
   - Example: Port administratively shut down in inventory, but active traffic (2.4 Gbps) detected on live hardware.
   - Severity: **MAJOR** or **CRITICAL**.

### Resolution Actions
- **`APPLY_TO_INVENTORY`**: Commits the live discovered values to the `inventory` schema in a single ACID transaction and logs the action to the CDC audit trail.
- **`REJECT_ROGUE`**: Flags the hardware or link as unauthorized for physical auditing or disconnection.
- **`DISPATCH_WORK_ORDER`**: Dispatches a field audit workflow directly to **`Gaharu_BPMN_NGIN`** (e.g., `GAHARU-REC-202609-00891`).

---

## 4. Telecom-Enriched Alarm Correlation Engine

Unlike generic monitoring tools that only display a raw IP and event string, Netstream's enrichment engine maps incoming alarms across the complete physical, logical, optical, and service stack:

```
[RAW ALARM TRAP]
Source IP: 10.200.1.1
Event: LossOfSignal (LOS)
Interface: 100GE0/1/0/1
            │
            ▼
[NETSTREAM TOPOLOGY ENRICHMENT]
├── Physical Device: JKT-CORE-PE-01 (Huawei NetEngine 8000 X8)
├── Location & Space: JKT-DATACENTER-01, Floor 3, Rack RACK-DC-04 (Slot 1, Port 1)
├── Optical Fiber: CBL-TRK-JKT-BDG-01, Core Strand #12 (Trans-Java Backbone)
├── Leased Line Circuit: LL-TELKOM-EPL-10G-01 (Telkom Indonesia, Platinum 99.999% SLA)
├── Affected Services: 4 Corporate Services (PT Bank Central Asia Tbk, Bank Mandiri)
├── Financial Impact: $24,500.00 USD/month revenue exposure
└── Root Cause Diagnosis: FIBER_CUT_SP04 (Closure Splice Box #4)
```

---

## 5. Northbound TM Forum (TMF) Open APIs & Webhooks

### TM Forum Standard Endpoints

| TMF Standard | API Endpoint | Description |
|:---|:---|:---|
| **TMF638** | `GET /api/v1/tmf/serviceInventory/v4/service` | Active customer services, service specifications, and bandwidth |
| **TMF639** | `GET /api/v1/tmf/resourceInventory/v4/resource` | Physical chassis, optical ports, transceivers, and operational states |
| **TMF642** | `GET /api/v1/tmf/alarmManagement/v4/alarm` | Real-time alarms with correlated affected services and revenue risk |

### Outbound Webhooks (HMAC-SHA256)
- **Subscribed Systems**: ServiceNow ITSM, Salesforce CRM, SAP Billing, and `Gaharu_BPMN_NGIN`.
- **Event Topics**: `AlarmCritical`, `AlarmMajor`, `ReconciliationDiscrepancy`, `ResourceCreated`, `CircuitStateChanged`.
- **Security**: Webhook payloads are signed using HMAC-SHA256 with subscriber-specific shared secrets and include automatic retry policies.

---

## 6. Gaharu_BPMN_NGIN Integration Specification

Netstream orchestrates workflows with the organization's existing BPMN engine:

| Process Definition | Trigger Condition | Netstream Payload |
|:---|:---|:---|
| `network_reconciliation_audit_flow` | Unresolved severe discrepancy or optical loss | `{ recId: 5, discrepancy: "OPTICAL_ATTENUATION_BREACH", target: "Strand-18" }` |
| `incident_trouble_ticket_flow` | Critical alarm on customer-facing leased line | `{ alarmId: "ALM-20260914-001", circuitId: "LL-TELKOM-EPL-10G-01", sla: "PLATINUM" }` |
| `leased_line_cancellation_flow` | Orphaned / dormant leased line capacity identified | `{ circuitId: "LL-DORMANT-01", carrier: "Indosat", monthlyCostUsd: 1800 }` |
