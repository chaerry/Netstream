# Metro Ethernet Use Case: Jakarta to Surabaya Inter-City EVPL Service

## 1. Executive Summary

This document describes the design, technical architecture, and inventory data modeling for an enterprise-grade **Metro Ethernet Point-to-Point Service (EVPL - Ethernet Virtual Private Line)** connecting **Jakarta** (A-End) and **Surabaya** (Z-End).

The use case illustrates end-to-end Carrier Ethernet transport over an IP/MPLS core and DWDM optical backbone, demonstrating the utilization of:
1. **802.1Q VLAN Sub-Interfaces (VLAN Ports)** at the Metro Access / Demarcation nodes (UNI - User Network Interface).
2. **Virtual Circuit Identifier (VCID) / EoMPLS Pseudowires** at Provider Edge (PE) routers to transport Layer 2 Ethernet frames across the Layer 3 core backbone.
3. **End-to-End Service Resource Mapping (SRM)** in the Netstream Telecom Inventory System.

---

## 2. Service Profile & SLA Specifications

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Service Code** | `SVC-ME-2026-0250` | Unique inventory identifier |
| **Customer Name** | `PT Bank Central Asia (BCA) Tbk` | Enterprise subscriber |
| **Service Type** | `METRO_ETHERNET` | MEF 6.2 Ethernet Virtual Private Line (EVPL) |
| **Committed Information Rate (CIR)** | **2,000 Mbps (2 Gbps)** | Symmetrical bidirectional bandwidth |
| **Peak Information Rate (PIR)** | **2,000 Mbps (2 Gbps)** | Strict non-oversubscribed policing |
| **SLA Tier** | `PLATINUM` | Highest enterprise priority |
| **SLA Availability Target** | **99.99%** | Max downtime < 52.6 min/year |
| **Monthly Recurring Cost (MRC)** | **$8,500.00 USD** | Monthly contracted billing rate |
| **Operational Status** | `ACTIVE` | Live in production |
| **Origin Site (A-End)** | **Jakarta Mega Pop Hub** (`ID-CGK`) | Data Center Facility 1 (Cyber Tech Park) |
| **Termination Site (Z-End)** | **Surabaya Metro Gateway** (`ID-SUB`) | Surabaya Metro DC Facility (Cyber East Park) |

---

## 3. Technical Architecture & Utilization

### 3.1 Network Flow Diagram

```
[Jakarta Enterprise HQ]
          │
          │ 802.1Q Tagged (VLAN ID: 250)
          ▼
┌────────────────────────────────────────────────────────┐
│ Hop 1: Demarcation / Access Node (Jakarta)             │
│ Device : ID-CGK-METRO-AGG-01 (Cisco NCS 540)           │
│ Port   : TenGigE0/0/0.250 (VLAN 250 Dot1Q UNI)         │
│ Role   : METRO_ACCESS_A_END                            │
└─────────────────────────┬──────────────────────────────┘
                          │ NNI Uplink / Trunk
                          ▼
┌────────────────────────────────────────────────────────┐
│ Hop 2: Provider Edge Router (Jakarta)                  │
│ Device : ID-CGK-PE-RTR-01 (Cisco ASR-9904)             │
│ Port   : TenGigE0/0/1/0.250                            │
│ VNE    : PW-EVPL-CGK-SUB-VCID250025                    │
│ VCID   : 250025 (EoMPLS / L2Circuit Pseudowire)        │
│ Role   : PE_ROUTER_ORIGIN_VCID                         │
└─────────────────────────┬──────────────────────────────┘
                          │ 100G IP/MPLS Core Trunk
                          ▼
┌────────────────────────────────────────────────────────┐
│ Hop 3: Optical Transport Layer                         │
│ Device : ID-CGK-DWDM-OPT-01 (Huawei OptiX OSN 9800)    │
│ Port   : OTU4-1/1/1 (100G Transponder Lambda)          │
│ Role   : DWDM_OPTICAL_TRANSPORT                        │
└─────────────────────────┬──────────────────────────────┘
                          │ Long-Haul Java Fiber Link
                          ▼
┌────────────────────────────────────────────────────────┐
│ Hop 4: Provider Edge Router (Surabaya)                 │
│ Device : ID-SUB-PE-RTR-01 (Cisco ASR-9904)             │
│ Port   : TenGigE0/0/1/0.250                            │
│ VNE    : PW-EVPL-CGK-SUB-VCID250025                    │
│ VCID   : 250025 (Pseudowire De-encapsulation)          │
│ Role   : PE_ROUTER_TERMINATION_VCID                    │
└─────────────────────────┬──────────────────────────────┘
                          │ NNI Downlink / Trunk
                          ▼
┌────────────────────────────────────────────────────────┐
│ Hop 5: Demarcation / Access Node (Surabaya)            │
│ Device : ID-SUB-METRO-AGG-01 (Juniper ACX5448)         │
│ Port   : TenGigE0/0/0.250 (VLAN 250 Dot1Q UNI)         │
│ Role   : METRO_ACCESS_Z_END                            │
└─────────────────────────┬──────────────────────────────┘
                          │
                          │ 802.1Q Tagged (VLAN ID: 250)
                          ▼
[Surabaya Disaster Recovery Center / Branch]
```

---

## 4. Key Technology Concepts

### 4.1 802.1Q VLAN Port Tagging (UNI Layer)
- At the customer demarcation switch in Jakarta (`ID-CGK-METRO-AGG-01`), customer frames arrive on sub-interface `TenGigE0/0/0.250` tagged with **VLAN 250**.
- The same VLAN 250 tag is preserved and delivered at the destination handoff in Surabaya (`ID-SUB-METRO-AGG-01` port `TenGigE0/0/0.250`), providing transparent Layer 2 LAN extension between both data centers.

### 4.2 VCID / Pseudowire Encapsulation (Core Layer)
- On the Jakarta PE router (`ID-CGK-PE-RTR-01`), incoming VLAN 250 traffic is bound to an **EoMPLS (Ethernet over MPLS) Pseudowire** identified by **VCID: 250025**.
- The core MPLS network switches frames using MPLS labels without needing knowledge of customer MAC addresses or VLAN tags.
- The Surabaya PE router (`ID-SUB-PE-RTR-01`) terminates **VCID: 250025**, strips the MPLS transport and service labels, and forwards native 802.1Q Ethernet frames to the Surabaya Metro Aggregation switch.

---

## 5. Detailed End-to-End Hop Mappings

| Hop # | Device Hostname | Vendor & Model | Interface / Port | Virtual Element (VNE) / VCID | Resource Role | Allocated Bandwidth |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | `ID-CGK-METRO-AGG-01` | Cisco NCS 540 | `TenGigE0/0/0.250 (VLAN 250 Dot1Q)` | — | `METRO_ACCESS_A_END` | 2,000 Mbps |
| **2** | `ID-CGK-PE-RTR-01` | Cisco ASR-9904 | `TenGigE0/0/1/0.250 (VCID: 250025)` | `PW-EVPL-CGK-SUB-VCID250025` *(VLAN 250, VCID 250025)* | `PE_ROUTER_ORIGIN_VCID` | 2,000 Mbps |
| **3** | `ID-CGK-DWDM-OPT-01` | Huawei OptiX OSN 9800 | `OTU4-1/1/1` | — | `DWDM_OPTICAL_TRANSPORT` | 2,000 Mbps |
| **4** | `ID-SUB-PE-RTR-01` | Cisco ASR-9904 | `TenGigE0/0/1/0.250 (VCID: 250025)` | `PW-EVPL-CGK-SUB-VCID250025` *(VLAN 250, VCID 250025)* | `PE_ROUTER_TERMINATION_VCID` | 2,000 Mbps |
| **5** | `ID-SUB-METRO-AGG-01` | Juniper ACX5448 | `TenGigE0/0/0.250 (VLAN 250 Dot1Q)` | — | `METRO_ACCESS_Z_END` | 2,000 Mbps |

---

## 6. Device Configuration Templates (Reference)

### 6.1 Cisco ASR-9904 PE Configuration (`ID-CGK-PE-RTR-01`)
```ios
! L2VPN Pseudowire Configuration (Origin PE)
l2vpn
 pw-class ETHERNET-PW
  encapsulation mpls
 !
 xconnect group ME-CGK-SUB
  p2p P2P-BCA-250
   interface TenGigE0/0/1/0.250
   neighbor ipv4 10.240.20.1 pw-id 250025
    pw-class ETHERNET-PW
   !
  !
 !
!
interface TenGigE0/0/1/0.250 l2transport
 encapsulation dot1q 250
 rewrite ingress tag pop 1 symmetric
 bandwidth 2000000
!
```

### 6.2 Cisco ASR-9904 PE Configuration (`ID-SUB-PE-RTR-01`)
```ios
! L2VPN Pseudowire Configuration (Termination PE)
l2vpn
 pw-class ETHERNET-PW
  encapsulation mpls
 !
 xconnect group ME-CGK-SUB
  p2p P2P-BCA-250
   interface TenGigE0/0/1/0.250
   neighbor ipv4 10.240.10.1 pw-id 250025
    pw-class ETHERNET-PW
   !
  !
 !
!
interface TenGigE0/0/1/0.250 l2transport
 encapsulation dot1q 250
 rewrite ingress tag pop 1 symmetric
 bandwidth 2000000
!
```

### 6.3 Cisco NCS 540 Metro Demarcation (`ID-CGK-METRO-AGG-01`)
```ios
interface TenGigE0/0/0.250
 description BCA-Jakarta-HQ-Metro-Ethernet-UNI
 encapsulation dot1q 250
 service-policy input POLICE-2GBPS-INGRESS
 service-policy output SHAPE-2GBPS-EGRESS
!
```

### 6.4 Juniper ACX5448 Metro Demarcation (`ID-SUB-METRO-AGG-01`)
```junos
interfaces {
    xe-0/0/0 {
        unit 250 {
            description "BCA-Surabaya-DR-Metro-Ethernet-UNI";
            encapsulation vlan-bridge;
            vlan-id 250;
        }
    }
}
```

---

## 7. Database Entity Mapping (Seed Data Reference)

### 7.1 Entity UUID Identifiers
- **Service ID**: `f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03`
- **VNE (Pseudowire) ID**: `e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03`
- **Port IDs**:
  - `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01`: `ID-CGK-METRO-AGG-01` (`TenGigE0/0/0.250`)
  - `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02`: `ID-CGK-PE-RTR-01` (`TenGigE0/0/1/0.250`)
  - `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01`: `ID-CGK-DWDM-OPT-01` (`OTU4-1/1/1`)
  - `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03`: `ID-SUB-PE-RTR-01` (`TenGigE0/0/1/0.250`)
  - `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04`: `ID-SUB-METRO-AGG-01` (`TenGigE0/0/0.250`)
- **Mapping IDs**:
  - Hop 1: `f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
  - Hop 2: `f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`
  - Hop 3: `f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13`
  - Hop 4: `f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14`
  - Hop 5: `f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15`

---

## 8. User Manual: Operating & Visualizing Metro Ethernet Services in Netstream

This section provides a step-by-step operator guide for viewing, analyzing, and verifying the Metro Ethernet circuit topology within the **Netstream Telecom Inventory Application**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NETSTREAM OPERATOR WORKFLOW: METRO ETHERNET INVENTORY                       │
│                                                                             │
│  [1. Navigate] ──> [2. Filter] ──> [3. View Schematic] ──> [4. Deep Dive]  │
│  Services Tab      SVC-ME-2026      Port-to-Port Flow       VCID & VLAN     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Open Service Inventory & Resource Mapping

1. Launch your web browser and navigate to the Netstream application:
   ```
   http://localhost:5173/inventory
   ```
2. In the left navigation sidebar, click on **Inventory Module** and select the **Services & Resource Map** sub-tab (or click the `<Route />` icon).
3. The dashboard displays the live KPI summary cards:
   - **Active Customer Services**: Total provisioned customer circuits across the national backbone.
   - **Provisioned Bandwidth Load**: Aggregate traffic load in Gbps.
   - **Monthly Recurring Revenue (MRR)**: Contracted monthly recurring revenue value ($ USD).

---

### Step 2: Locate the Metro Ethernet Service

1. In the **Search Bar** above the services table, type `SVC-ME` or `Bank Central Asia`.
2. Locate the service row with the following details:
   - **Service Code**: `SVC-ME-2026-0250`
   - **Customer**: `PT Bank Central Asia (BCA) Tbk`
   - **Type**: `METRO_ETHERNET`
   - **Bandwidth**: `2 Gbps` (2,000 Mbps)
   - **SLA Tier**: `PLATINUM (99.99%)`
   - **Monthly Cost**: `$8,500/mo`
   - **Status**: `ACTIVE`
3. Click on the row or click the **"View Hops"** button to load the end-to-end circuit topology into the visualizer panel at the top.

---

### Step 3: Explore the Graphical Device & Port Connectivity Schematic

When **Graphical Schematic** mode is active (default), the visualizer renders the end-to-end physical and logical circuit path:

```
[UNI-A: Jakarta HQ] ──(10G UNI)──> [Hop 1: Cisco NCS 540] ──(Dot1Q Trunk)──> [Hop 2: Cisco ASR PE]
                                                                                   │
                                                         (Pseudowire VCID: 250025) │
                                                                                   ▼
[UNI-Z: Surabaya DR] <──(10G UNI)── [Hop 5: Juniper ACX] <──(Dot1Q Trunk)── [Hop 4: Cisco ASR PE] <──(100G DWDM)── [Hop 3: Huawei OptiX]
```

#### Key Visual Indicators to Observe:

1. **A-End & Z-End Demarcation Badges**:
   - **UNI-A (Jakarta Mega Pop Hub)**: Shows incoming **VLAN ID: 250 (Dot1Q)**.
   - **UNI-Z (Surabaya Metro Gateway)**: Shows destination handoff with **VLAN ID: 250 (Dot1Q)**.

2. **Hardware Chassis Cards**:
   - Each hop is rendered as an equipment chassis card labeled with its **Hostname**, **Equipment Type**, and **Vendor**.
   - **Port Interface Demarcation**: Displays the exact physical/sub-interface with an active pulsing green LED (e.g. `TenGigE0/0/0.250 (VLAN 250 Dot1Q)`).

3. **Logical Circuit / VCID Highlight**:
   - On **Hop 2** (`ID-CGK-PE-RTR-01`) and **Hop 4** (`ID-SUB-PE-RTR-01`), look for the amber badge:
     ```
     ⚡ PW-EVPL-CGK-SUB-VCID250025 [VCID: 250025]
     ```
   - This confirms that Layer 2 Ethernet frames with VLAN 250 are encapsulated into an EoMPLS Pseudowire cross-connect across the IP core.

4. **Animated Optical Laser Cables**:
   - Glowing conduits connect each node with traveling laser light pulses (`animate-laser`), visually showing active 2 Gbps data transmission.
   - Conduits display media tags: `10G UNI`, `10G Dot1Q Trunk`, `100G DWDM Lambda (193.1 THz)`, and `MPLS Pseudowire / VCID Tunnel`.

---

### Step 4: Interactive Hop Inspection (Deep-Dive)

1. Click on any **Device Chassis Card** (e.g. click **Hop #2** `ID-CGK-PE-RTR-01`).
2. The card highlights with a glowing cyan border and active ring.
3. The **Deep-Dive Inspector Panel** below the canvas immediately updates to reveal:
   - **Active Interface**: `TenGigE0/0/1/0.250 (VCID: 250025)`
   - **Role**: `PE_ROUTER_ORIGIN_VCID`
   - **Attached Virtual Circuit**: `PW-EVPL-CGK-SUB-VCID250025 (VCID: 250025)`
   - **Allocated Capacity**: `2000 Mbps CIR`

---

### Step 5: Switch to Resource Matrix (Tabular View)

1. At the top right of the visualizer card, click the **"Resource Matrix"** button.
2. The display switches to an exhaustive tabular breakdown listing all 5 hops:
   - **Hop #**: Sequence order from 1 to 5.
   - **Network Device**: Hostname and chassis type.
   - **Port / Interface (VLAN)**: Physical and sub-interface dot1q assignments.
   - **Logical Circuit / VCID**: Attached Virtual Network Elements (VNE).
   - **Resource Role**: Architectural role in the network path.
   - **Bandwidth**: Allocated CIR capacity (2 Gbps per hop).
3. Click **"Graphical Schematic"** to return to the interactive diagram at any time.

---

### Step 6: Verifying Corresponding Physical & Logical Assets

#### A. Checking the Physical Demarcation Port:
1. In the sidebar, click **Physical Hardware & Racks**.
2. Search for device `ID-CGK-METRO-AGG-01`.
3. Open the device inspector or port allocation view to confirm that `TenGigE0/0/0.250` is marked as `ALLOCATED` with service `SVC-ME-2026-0250`.

#### B. Checking the Logical Pseudowire VNE:
1. In the sidebar, click **Logical & Virtual (VNE)**.
2. In the VNE catalog, verify the presence of:
   - **VNE Name**: `PW-EVPL-CGK-SUB-VCID250025`
   - **VNF Type**: `EoMPLS_PW_L2CIRCUIT`
   - **VLAN ID**: `250`
   - **VRF / VCID Identifier**: `VCID: 250025`
   - **Status**: `ACTIVE`

---

### Step 7: Troubleshooting & Common FAQs

| Question / Symptom | Solution / Checkpoint |
| :--- | :--- |
| **VLAN mismatch between A-End and Z-End?** | Verify that both Hop 1 and Hop 5 sub-interfaces are configured for `Dot1Q 250`. Check that customer CPE devices are tagging egress frames with VLAN 250. |
| **Pseudowire state is down or VCID mismatch?** | Ensure that both PE routers (`ID-CGK-PE-RTR-01` and `ID-SUB-PE-RTR-01`) specify the exact same `pw-id 250025` and target neighbor loopback IPs (`10.240.10.1` and `10.240.20.1`). |
| **Bandwidth policing drops packets?** | Confirm that traffic does not exceed 2,000 Mbps CIR. Check ingress policing stats on `TenGigE0/0/0.250`. |
| **Optical Lambda degradation?** | Inspect optical power levels on `ID-CGK-DWDM-OPT-01` port `OTU4-1/1/1` to ensure RX optical margin is within standard tolerances (> -18 dBm). |

---

## 9. Standard Operating Procedures (SOP): What Users Should Do in Application

This section specifies the concrete actions that network planners, NOC engineers, and inventory operators must execute in the **Netstream Telecom Inventory Application** to manage the end-to-end Metro Ethernet lifecycle.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ END-TO-END OPERATOR WORKFLOW IN NETSTREAM APPLICATION                                  │
│                                                                                        │
│  [Task A] ──> [Task B] ──> [Task C] ──> [Task D] ──> [Task E] ──> [Task F]             │
│  Provision    Allocate     Create VNE   Verify Path  Lifecycle    Capacity & Cost      │
│  Service      VLAN Port    (VCID)       Topology     (Power)      Planning             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Task A: Provisioning a New Metro Ethernet Customer Service

When a new enterprise order arrives from sales/commercial:

1. In the sidebar, navigate to **Inventory Module ➔ Services & Resource Map**.
2. Click the top-right **"+ Provision Service"** button.
3. In the modal dialog:
   - **Service Identifier Code**: Input a structured telecom service ID, e.g. `SVC-ME-2026-0250`.
   - **Customer / Enterprise Name**: Select `PT Bank Central Asia (BCA) Tbk (CUST-BBCA-002)` from the *Banking & Financial Services* catalog (or select *+ Custom Enterprise* for ad-hoc customers).
   - **Service Technology Type**: Select `Metro Ethernet Access` from the dropdown.
   - **Provisioned Bandwidth (Mbps)**: Input `2000` (representing 2 Gbps CIR).
   - **SLA Tier**: Select `PLATINUM (99.99%)`.
   - **Monthly Cost ($ USD)**: Input `8500` (contracted recurring revenue).
4. Click **"Provision Service"**.
5. **Expected Result**: The service appears in the active service table in `PROVISIONING` or `ACTIVE` status with monthly MRR updated in the dashboard KPI card.

---

### Task B: Demarcation Port Allocation & 802.1Q VLAN Assignment

To bind the customer handoff port on the physical metro switch:

1. In the sidebar, navigate to **Inventory Module ➔ Physical Hardware & Racks**.
2. In the device table, locate the Metro Aggregation Switch:
   - Hostname: `ID-CGK-METRO-AGG-01` (Cisco NCS 540) in `Jakarta Mega Pop Hub`.
3. Click the device row or click **"Inspect Ports"**.
4. In the Port Management matrix:
   - Locate the target fiber interface `TenGigE0/0/0` (10 Gbps SFP+).
   - Click **"Allocate Port"** or create a sub-interface:
     - Set Sub-Interface Name: `TenGigE0/0/0.250 (VLAN 250 Dot1Q)`.
     - Select Bound Service: `SVC-ME-2026-0250` (*PT Bank Central Asia Tbk*).
     - Set Allocation Status: `ALLOCATED (Active Traffic)`.
     - Assign Allocated Bandwidth: `2000 Mbps`.
5. Repeat the same step for the destination Metro Aggregation Switch in Surabaya:
   - Hostname: `ID-SUB-METRO-AGG-01` (Juniper ACX5448).
   - Sub-interface: `TenGigE0/0/0.250 (VLAN 250 Dot1Q)`.
6. **Expected Result**: Both ports are flagged as allocated (`isAllocated = true`) and appear with active green LED indicators in the topology.

---

### Task C: Creating the Logical Pseudowire VNE (VCID Cross-Connect)

To model the Layer 2 MPLS Pseudowire tunnel in the virtual inventory:

1. In the sidebar, navigate to **Inventory Module ➔ Logical & Virtual (VNE)**.
2. Click the top-right **"+ Provision VNE"** button.
3. Fill in the logical element parameters:
   - **Hypervisor / Host Routing Chassis**: Select `ID-CGK-PE-RTR-01` (Cisco ASR-9904).
   - **Virtual Network Element Name**: Input `PW-EVPL-CGK-SUB-VCID250025`.
   - **VNF Technology Type**: Select `EoMPLS_PW_L2CIRCUIT` (or `vRouter-L2Circuit`).
   - **VLAN ID**: Input `250`.
   - **VRF / VCID Identifier**: Input `VCID: 250025`.
   - **Virtual Compute Allocation**: 4 vCPU, 8 GB RAM, 40 GB Storage.
4. Click **"Save & Deploy VNE"**.
5. **Expected Result**: The Pseudowire element is registered in the logical catalog and bound to the PE router.

---

### Task D: Verifying the End-to-End Hop-by-Hop Topology

To validate the circuit connectivity before signing off the commissioning checklist:

1. Return to **Services & Resource Map** (`/inventory` tab: `services`).
2. Click on `SVC-ME-2026-0250` in the list.
3. Review the **Graphical Schematic** visualizer:
   - **Step 4.1**: Check that **UNI-A** (`Jakarta HQ - VLAN 250`) connects to **Hop #1** (`ID-CGK-METRO-AGG-01`).
   - **Step 4.2**: Check that **Hop #1** links to **Hop #2** (`ID-CGK-PE-RTR-01`) with port `TenGigE0/0/1/0.250` and amber badge `PW-EVPL-CGK-SUB-VCID250025 (VCID: 250025)`.
   - **Step 4.3**: Check that **Hop #2** links to **Hop #3** (`ID-CGK-DWDM-OPT-01`) over `100G DWDM Optical Lambda (OTU4-1/1/1)`.
   - **Step 4.4**: Check that **Hop #3** reaches **Hop #4** (`ID-SUB-PE-RTR-01`) in Surabaya with termination badge `VCID: 250025`.
   - **Step 4.5**: Check that **Hop #4** terminates at **Hop #5** (`ID-SUB-METRO-AGG-01`) delivering **VLAN 250 (Dot1Q)** to **UNI-Z** (`Surabaya DR`).
   - **Step 4.6**: Verify that traveling laser pulses flow continuously across all conduits.
4. Click on individual **Chassis Cards** to inspect interface speeds, CIR allocations, and roles in the bottom inspector panel.

---

### Task E: Service Lifecycle Management (Activation & Suspension)

For operational maintenance, billing suspensions, or emergency maintenance:

1. In the **Services & Resource Map** table, locate the target service row.
2. In the **Topology Actions** column on the right:
   - Click the **Power Icon (`<Power />`)** to toggle status between `ACTIVE` and `SUSPENDED`.
3. When suspended:
   - The status badge transitions from green (`ACTIVE`) to amber (`SUSPENDED`).
   - The active path telemetry flags the circuit as dormant.
4. Click the **Power Icon** again to restore full operational state (`ACTIVE`).

---

### Task F: Capacity Planning & Cost Optimization

To ensure the backbone is not oversubscribed and analyze financial performance:

1. In the sidebar, navigate to **Inventory Module ➔ Planning & Cost Engine**.
2. Review the site capacity utilization:
   - **Jakarta Central PoP Hub (`ID-CGK`)**: Check total racks, device count, and port utilization (target < 75%).
   - **Surabaya Metro Gateway (`ID-SUB`)**: Check available 10G/100G transponder capacity.
3. In the **Cost Engine** calculator:
   - Review the monthly revenue generated by `SVC-ME-2026-0250` ($8,500/mo).
   - Simulate adding a redundant second 2 Gbps path (protection switching) to calculate incremental OPEX and CAPEX margins.

---

## 10. Architectural Role of "Logical & Virtual NE" Menu & How VLAN/VCID Binding Works

This section answers two fundamental telecom inventory architecture questions:
1. **What does the "Logical & Virtual NE" menu actually do?**
2. **Where and how do operators define, create, and bind VLAN ports and VCIDs?**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NETSTREAM 4-TIER TELECOM INVENTORY ARCHITECTURE (VC4 S2C / TM FORUM ODA)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. SERVICE LAYER        │ inv_services (MPLS L3VPN, DIA, Metro Ethernet)    │
│                         ▼ Bound to                                          │
│ 2. LOGICAL/VIRTUAL (VNE)│ inv_virtual_network_elements (VCID, VRF, VNF, PW) │
│                         ▼ Bound to                                          │
│ 3. PHYSICAL INTERFACES  │ inv_device_ports (VLAN Sub-interfaces, SFP+ 10G)  │
│                         ▼ Housed in                                         │
│ 4. PHYSICAL EQUIPMENT   │ inv_network_devices (ASR-9904, NCS 540, OSN 9800) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 10.1 What Does the "Logical & Virtual NE" Menu Actually Do?

In modern carrier telecom networks, physical chassis (Routers, Switches, Servers) do not carry traffic in raw untagged format; they host **logical routing instances** and **virtual circuit abstractions**.

The **Logical & Virtual NE** module represents Tier 2 of the inventory stack:

| Logical Asset Type | Purpose in Telecom Network | Example in Netstream |
| :--- | :--- | :--- |
| **Layer 2 Pseudowire / VCID** | Point-to-point Layer 2 tunnels across MPLS core (EoMPLS / L2Circuit). | `PW-EVPL-CGK-SUB-VCID250025` (*VCID: 250025, VLAN 250*) |
| **Layer 3 VPN VRF Instance** | Isolated IP routing tables for enterprise customer multi-tenancy. | `VRF_MANDIRI_PROD`, `VRF_SECURITY_EDGE` |
| **Virtual Network Functions (VNF)** | Software network appliances running on hypervisors (NFV). | Cisco CSR1000v vRouter, Fortinet vFortiGate vFirewall |
| **VLAN Logical Segmentation** | 802.1Q broadcast domain tags mapped across metro access rings. | `VLAN ID: 250`, `VLAN ID: 2100` |

---

### 10.2 How to Define, Create, and Bind New VLANs & VCIDs

Operators have two complementary methods in the application:

#### Method 1: On-the-Fly via the "Allocate Port" Modal (Physical Inventory)
When provisioning a port to a service in **Physical Hardware & Racks**:
1. Open the device port inspector and click **"Allocate Port"** on any physical interface (e.g. `TenGigE0/0/0`).
2. In the modal's **Section 4: Logical Encapsulation**:
   - **Define New VLAN**: Input the desired **Dot1Q VLAN ID** (e.g. `300`). The system automatically creates logical sub-interface `TenGigE0/0/0.300 (VLAN 300 Dot1Q)`.
   - **Define / Bind VCID**: Input the **VCID / Pseudowire Identifier** (e.g. `300100`). The system registers the cross-connect `PW-EVPL-300100`.
3. Click **"Allocate Port"**: The service topology immediately updates with the new VLAN sub-interface and VCID badge.

#### Method 2: Centralized Provisioning via "Logical & Virtual NE" Menu
To provision shared or standalone virtual network elements before allocating physical ports:
1. In the sidebar, navigate to **Logical & Virtual (VNE)**.
2. Click **"Deploy VNE"**.
3. Set **VNF / Logical Circuit Flavor** to `MPLS Pseudowire / L2Circuit (VCID)` or `EVPN-VPWS`.
4. Enter the **Assigned VLAN ID** (e.g. `300`) and **VRF / VCID Identifier** (e.g. `VCID: 300100`).
5. Click **"Save & Deploy VNE"**: The VCID instance becomes available across all service resource mappings.



