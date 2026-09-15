# Standard Operating Procedure (SOP): Manual Service Provisioning Guide
## Point-to-Point (P2P) Metro Ethernet EVPL — PT. Bank Rakyat Indonesia (BRI) Tbk

---

### Document Information
- **Title:** End-to-End Manual Service Creation & Resource Provisioning
- **Customer:** `PT. Bank Rakyat Indonesia (BRI) Tbk` (`CUST-BBRI-003`)
- **Service Type:** `METRO_ETHERNET` (Point-to-Point EVPL / MEF 6.2)
- **Origin Site (A-End):** `ID-CGK-METRO-AGG-01` — Port `TenGigE0/0/0` (VLAN 253)
- **Termination Site (Z-End):** `ID-SUB-METRO-AGG-01` — Port `TenGigE0/0/0` (VLAN 253)
- **Core Virtual Circuit ID (VCID):** `100253` (EoMPLS Pseudowire)
- **Committed Bandwidth:** `10 Gbps` (`10,000 Mbps`)
- **SLA Tier:** `PLATINUM` (99.99% Availability Target)
- **Target File Path:** `documents/service_manual_provisioning_bri_p2p_guide.md`

---

## 1. Service Architecture & Network Topology

### 1.1 End-to-End Service Path (Jakarta to Surabaya P2P)

```
       [PT. Bank Rakyat Indonesia (BRI) Tbk - Jakarta HQ]
                               │
                               │ 802.1Q Dot1Q (VLAN ID: 253)
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│ HOP 1: Metro Access Demarcation Node (Jakarta A-End)                   │
│ Device : ID-CGK-METRO-AGG-01 (Cisco NCS 540)                           │
│ Port   : TenGigE0/0/0.253 (Logical Sub-interface • VLAN 253 Dot1Q UNI) │
│ Role   : METRO_ACCESS_A_END                                            │
│ Speed  : 10 Gbps (10,000 Mbps CIR)                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ NNI Uplink / Metro Trunk
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ HOP 2: Provider Edge Router (Jakarta PE Core)                          │
│ Device : ID-CGK-PE-RTR-01 (Cisco ASR-9904)                             │
│ Port   : TenGigE0/0/1/0.253                                            │
│ VNE    : PW-EVPL-CGK-SUB-VCID100253                                    │
│ VCID   : 100253 (EoMPLS Layer 2 Circuit Encapsulation)                 │
│ Role   : PE_ROUTER_ORIGIN_VCID                                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 100G IP/MPLS Core Trunk
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ HOP 3: DWDM Long-Haul Backbone Optical Transport                      │
│ Device : ID-CGK-DWDM-OPT-01 (Huawei OptiX OSN 9800)                    │
│ Port   : OTU4-1/1/1 (100G Optical Lambda • 780 km Java Backbone)       │
│ Role   : DWDM_OPTICAL_TRANSPORT                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Trans-Java DWDM Fiber Ring
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ HOP 4: Provider Edge Router (Surabaya PE Core)                         │
│ Device : ID-SUB-PE-RTR-01 (Cisco ASR-9904)                             │
│ Port   : TenGigE0/0/1/0.253                                            │
│ VNE    : PW-EVPL-CGK-SUB-VCID100253                                    │
│ VCID   : 100253 (EoMPLS Pseudowire De-encapsulation)                   │
│ Role   : PE_ROUTER_TERMINATION_VCID                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ NNI Downlink / Metro Trunk
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ HOP 5: Metro Access Demarcation Node (Surabaya Z-End)                  │
│ Device : ID-SUB-METRO-AGG-01 (Juniper ACX5448)                         │
│ Port   : TenGigE0/0/0.253 (Logical Sub-interface • VLAN 253 Dot1Q UNI) │
│ Role   : METRO_ACCESS_Z_END                                            │
│ Speed  : 10 Gbps (10,000 Mbps CIR)                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ 802.1Q Dot1Q (VLAN ID: 253)
                                    ▼
       [PT. Bank Rakyat Indonesia (BRI) Tbk - Surabaya Data Center]
```

---

## 2. Step 1: Steps to Create the Service

You can create the service using **Method A (Web User Interface)** or **Method B (REST API / Backend CLI)**.

### Method A: Web User Interface (Netstream GUI)

1. **Navigate to the Services View:**
   - Open your browser and navigate to `http://localhost:3000/inventory`.
   - On the top navigation bar or tabs, click the **"Services"** tab (`ServiceInventoryView`).

2. **Open the Provisioning Modal:**
   - On the top right of the Services table, click the **"+ Provision Service"** button.
   - The modal titled **"Provision Telecom Customer Service — Service Inventory"** will appear.

3. **Fill in the Required Parameters:**
   - **Service Identifier Code:** Enter `SVC-ME-2026-0253` (or any enterprise code following your standard, e.g. `SVC-BRI-P2P-100253`).
   - **Customer / Enterprise Name:** Open the customer dropdown. Under the category `Banking & Financial Services`, select:
     `PT Bank Rakyat Indonesia (BRI) Tbk (CUST-BBRI-003)`.
     *(The system will automatically set the enterprise tier to `PLATINUM`).*
   - **Service Technology Type:** Select **`Metro Ethernet Access`** (or `L2 VPN VPLS / EVPN`).
   - **Provisioned Bandwidth (Mbps):** Enter `10000` (representing `10 Gbps`).
   - **A-End Origin PoP / Core Site:** Select **`Jakarta Mega Pop Hub (ID-CGK)`** (`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`).
   - **Z-End Termination Site:** Select **`Surabaya Metro Gateway (ID-SUB)`** (`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44`).
   - **SLA Tier:** Select `PLATINUM (99.99%)`.
   - **SLA Availability (%):** `99.99` (auto-populated with Platinum tier).
   - **Monthly Cost ($ USD):** Enter contracted MRC, e.g., `12500` or `15000`.

4. **Submit Provisioning Order:**
   - Click **"Provision Service"** at the bottom right.
   - Upon successful creation, the modal closes and the newly provisioned service immediately appears at the top of the Service Inventory table.

---

### Method B: REST API / cURL Execution

You can provision the entire service along with its end-to-end 5-hop resource mappings via a single `POST` request to the backend:

```bash
curl -X POST http://localhost:8070/api/inventory/services \
  -H "Content-Type: application/json" \
  -d '{
    "serviceCode": "SVC-ME-2026-0253",
    "customerName": "PT Bank Rakyat Indonesia (BRI) Tbk",
    "serviceType": "METRO_ETHERNET",
    "bandwidthMbps": 10000,
    "slaTier": "PLATINUM",
    "slaAvailabilityPct": 99.99,
    "monthlyRecurringCost": 15000.00,
    "aEndLocationId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "zEndLocationId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "mappings": [
      {
        "deviceId": "c3eebc99-9c0b-4ef8-bb6d-6bb9bd380301",
        "portId": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e53",
        "vneId": null,
        "resourceRole": "METRO_ACCESS_A_END",
        "hopOrder": 1,
        "allocatedBandwidthMbps": 10000
      },
      {
        "deviceId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
        "portId": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e54",
        "vneId": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53",
        "resourceRole": "PE_ROUTER_ORIGIN_VCID",
        "hopOrder": 2,
        "allocatedBandwidthMbps": 10000
      },
      {
        "deviceId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
        "portId": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01",
        "vneId": null,
        "resourceRole": "DWDM_OPTICAL_TRANSPORT",
        "hopOrder": 3,
        "allocatedBandwidthMbps": 10000
      },
      {
        "deviceId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
        "portId": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e55",
        "vneId": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53",
        "resourceRole": "PE_ROUTER_TERMINATION_VCID",
        "hopOrder": 4,
        "allocatedBandwidthMbps": 10000
      },
      {
        "deviceId": "c3eebc99-9c0b-4ef8-bb6d-6bb9bd380304",
        "portId": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e56",
        "vneId": null,
        "resourceRole": "METRO_ACCESS_Z_END",
        "hopOrder": 5,
        "allocatedBandwidthMbps": 10000
      }
    ]
  }'
```

---

## 3. Step 2: Assigning Logical Ports, VCID, and Topology Type (P2P)

Carrier Ethernet Point-to-Point (EVPL) requires establishing 3 key constructs in the inventory database:

### 3.1 Logical 802.1Q Ports (Sub-interfaces)
Customer traffic arrives on physical 10Gbps ports (`TenGigE0/0/0`) with an 802.1Q encapsulation tag (`VLAN 253`). In Netstream, physical and logical sub-interfaces can be assigned through the **Frontend Web GUI**, via the **REST API**, or via database queries.

#### Method 1: Frontend GUI Steps (No Database Access Needed)
Operators can allocate physical ports to customer circuits and define logical 802.1Q VLAN sub-interfaces directly from the browser:

1. **Open Physical Inventory:**
   - Go to `http://localhost:3000/inventory` and click the **"Physical"** tab (`PhysicalInventoryView`).
2. **Inspect Ports on A-End Node (`ID-CGK-METRO-AGG-01`):**
   - Search or locate device card **`ID-CGK-METRO-AGG-01`** (Cisco NCS 540 in Jakarta Mega Pop Hub).
   - Click the **"Ports"** badge/button on the card to open the **`PortInspectorModal`**.
   - Locate port **`TenGigE0/0/0`** (10,000 Mbps).
   - Click the **"Allocate to Circuit"** button (⚡ Zap icon) next to `TenGigE0/0/0`.
3. **Configure the Logical Port in `AllocatePortModal`:**
   - **Active Circuit / Service:** Select `SVC-ME-2026-0253 - PT Bank Rakyat Indonesia (BRI) Tbk`.
   - **Resource Role:** Select or type `METRO_ACCESS_A_END`.
   - **VLAN ID (802.1Q Dot1Q):** Enter `253`.
     *(The system automatically creates and tags the logical port as `TenGigE0/0/0.253 (VLAN 253 Dot1Q)`).*
   - **Committed Bandwidth:** `10000` Mbps.
   - **Hop Order:** `1`.
   - Click **"Allocate Port to Circuit"**.
4. **Repeat for Z-End Demarcation Node (`ID-SUB-METRO-AGG-01`):**
   - Locate device **`ID-SUB-METRO-AGG-01`** (Juniper ACX5448 in Surabaya Metro Gateway).
   - Open its **"Ports"** inspector, locate `TenGigE0/0/0`, and click **"Allocate to Circuit"**.
   - Service: `SVC-ME-2026-0253`, Role: `METRO_ACCESS_Z_END`, VLAN ID: `253`, Hop Order: `5`.
   - Click **"Allocate Port to Circuit"**.
5. **Configure PE Core Sub-Interfaces & VCID Binding:**
   - On **`ID-CGK-PE-RTR-01`** (Jakarta PE): Allocate port `TenGigE0/0/1/0` to Hop 2, VLAN: `253`, VCID: `100253`, Role: `PE_ROUTER_ORIGIN_VCID`.
   - On **`ID-SUB-PE-RTR-01`** (Surabaya PE): Allocate port `TenGigE0/0/1/0` to Hop 4, VLAN: `253`, VCID: `100253`, Role: `PE_ROUTER_TERMINATION_VCID`.

---

#### Method 2: REST API / cURL (Command Line or Postman)

##### A. Create a Logical Sub-Interface Port on a Device
```bash
# Add sub-interface TenGigE0/0/0.253 to ID-CGK-METRO-AGG-01
curl -X POST http://localhost:8070/api/v1/inventory/devices/c3eebc99-9c0b-4ef8-bb6d-6bb9bd380301/ports \
  -H "Content-Type: application/json" \
  -d '{
    "portName": "TenGigE0/0/0.253 (VLAN 253 Dot1Q)",
    "portSpeedMbps": 10000,
    "mediumType": "FIBER_SINGLE_MODE",
    "connectorType": "LC/UPC"
  }'
```

##### B. Allocate Port to Active Customer Service
```bash
# Allocate the port to SVC-ME-2026-0253 as Hop #1
curl -X POST http://localhost:8070/api/v1/inventory/devices/ports/d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e53/allocate \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "<SERVICE_UUID_FROM_STEP_1>",
    "resourceRole": "METRO_ACCESS_A_END",
    "allocatedBandwidthMbps": 10000,
    "hopOrder": 1
  }'
```

---

#### Method 3: Direct Database SQL (For Database Administrators)
```sql
-- 1. A-End Demarcation Port on ID-CGK-METRO-AGG-01
INSERT INTO inventory.inv_device_ports (
    id, device_id, port_name, port_speed_mbps, medium_type, connector_type, is_operational, is_allocated
) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380e53',
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380301', -- ID-CGK-METRO-AGG-01
    'TenGigE0/0/0.253 (VLAN 253 Dot1Q)',
    10000,
    'FIBER_SINGLE_MODE',
    'LC/UPC',
    TRUE,
    TRUE
) ON CONFLICT (device_id, port_name) DO UPDATE SET is_allocated = TRUE;

-- 2. Core PE Origin Sub-Interface on ID-CGK-PE-RTR-01
INSERT INTO inventory.inv_device_ports (
    id, device_id, port_name, port_speed_mbps, medium_type, connector_type, is_operational, is_allocated
) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380e54',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', -- ID-CGK-PE-RTR-01
    'TenGigE0/0/1/0.253 (VCID: 100253)',
    10000,
    'FIBER_SINGLE_MODE',
    'LC/UPC',
    TRUE,
    TRUE
) ON CONFLICT (device_id, port_name) DO UPDATE SET is_allocated = TRUE;

-- 3. Core PE Termination Sub-Interface on ID-SUB-PE-RTR-01
INSERT INTO inventory.inv_device_ports (
    id, device_id, port_name, port_speed_mbps, medium_type, connector_type, is_operational, is_allocated
) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', -- ID-SUB-PE-RTR-01
    'TenGigE0/0/1/0.253 (VCID: 100253)',
    10000,
    'FIBER_SINGLE_MODE',
    'LC/UPC',
    TRUE,
    TRUE
) ON CONFLICT (device_id, port_name) DO UPDATE SET is_allocated = TRUE;

-- 4. Z-End Demarcation Port on ID-SUB-METRO-AGG-01
INSERT INTO inventory.inv_device_ports (
    id, device_id, port_name, port_speed_mbps, medium_type, connector_type, is_operational, is_allocated
) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380e56',
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380304', -- ID-SUB-METRO-AGG-01
    'TenGigE0/0/0.253 (VLAN 253 Dot1Q)',
    10000,
    'FIBER_SINGLE_MODE',
    'LC/UPC',
    TRUE,
    TRUE
) ON CONFLICT (device_id, port_name) DO UPDATE SET is_allocated = TRUE;
```

---

### 3.2 Virtual Network Element (VNE) for VCID: 100253
The Layer 2 circuit is encapsulated over the MPLS core between `ID-CGK-PE-RTR-01` and `ID-SUB-PE-RTR-01` using an **EoMPLS (Ethernet over MPLS) Pseudowire**. In Netstream, this is modeled as a Virtual Network Element (VNE) instance.

#### Method 1: Frontend GUI Steps (No Database Access Needed)
Operators can deploy and register the VCID Pseudowire instance via the GUI:

1. **Open Logical & Virtual Inventory:**
   - Go to `http://localhost:3000/inventory` and click the **"Logical & Virtual"** tab (`LogicalInventoryView`).
2. **Click "+ Deploy VNE":**
   - Click the purple **"+ Deploy VNE"** button on the top right.
   - The modal **"Provision Virtual Network Element (VNE)"** will open (`CreateVneModal`).
3. **Fill in the VCID Pseudowire Parameters:**
   - **VNE Instance Name:** `PW-EVPL-CGK-SUB-VCID100253`
   - **VNF / Logical Circuit Flavor:** Select **`MPLS Pseudowire / L2Circuit (VCID)`** (`EoMPLS_PW_L2CIRCUIT`).
   - **Assigned VLAN ID:** `253`
   - **VRF Routing Domain / VCID Identifier:** `VCID: 100253`
   - **vCPUs:** `4`
   - **RAM (GB):** `8`
   - **Storage (GB):** `40`
4. **Deploy:**
   - Click **"Deploy VNE"**.
   - The VNE is instantly provisioned and appears as an active card in the Virtual Layer Inventory with status `ACTIVE`.

---

#### Method 2: REST API / cURL (Command Line or Postman)
Deploy the Virtual Network Element instance using a standard HTTP request:

```bash
curl -X POST http://localhost:8070/api/v1/inventory/virtual \
  -H "Content-Type: application/json" \
  -d '{
    "hypervisorDeviceId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "vneName": "PW-EVPL-CGK-SUB-VCID100253",
    "vnfType": "EoMPLS_PW_L2CIRCUIT",
    "vlanId": 253,
    "vrfName": "VCID: 100253",
    "allocatedVcpu": 4,
    "allocatedRamGb": 8,
    "allocatedDiskGb": 40
  }'
```

**Expected JSON Response:**
```json
{
  "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53",
  "hypervisorDeviceId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
  "hypervisorHostname": "ID-CGK-PE-RTR-01",
  "vneName": "PW-EVPL-CGK-SUB-VCID100253",
  "vnfType": "EoMPLS_PW_L2CIRCUIT",
  "vlanId": 253,
  "vrfName": "VCID: 100253",
  "allocatedVcpu": 4,
  "allocatedRamGb": 8,
  "allocatedDiskGb": 40,
  "status": "ACTIVE"
}
```

---

#### Method 3: Direct Database SQL (For Database Administrators)
```sql
INSERT INTO inventory.inv_virtual_network_elements (
    id,
    hypervisor_device_id,
    vne_name,
    vnf_type,
    vlan_id,
    vrf_name,
    allocated_vcpu,
    allocated_ram_gb,
    allocated_disk_gb,
    status,
    created_by,
    updated_by
) VALUES (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', -- Attached to Jakarta PE Router
    'PW-EVPL-CGK-SUB-VCID100253',
    'EoMPLS_PW_L2CIRCUIT',
    253,
    'VCID: 100253',
    4,
    8,
    40,
    'ACTIVE',
    'system',
    'system'
) ON CONFLICT (vne_name) DO UPDATE SET
    vlan_id = EXCLUDED.vlan_id,
    vrf_name = EXCLUDED.vrf_name;
```

---

### 3.3 Topology Service Type: Point-to-Point (P2P / EVPL)
- Set `serviceType = "METRO_ETHERNET"` (or `L2_VPN_MPLS`).
- Establish strict point-to-point binding by setting:
  - `a_end_location_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'` (Jakarta Mega Pop Hub)
  - `z_end_location_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'` (Surabaya Metro Gateway)
- Link the 5 hops in sequential `hop_order` (1 to 5) in `inv_service_resource_mappings`.

---

## 4. Step 3: How the Service is Displayed in "Graphical Schematic"

When the operator clicks on `SVC-ME-2026-0253` in the Service Inventory table, the component **`ServiceHopVisualizer.tsx`** renders an interactive visual topology at the top of the screen.

### 4.1 Circuit Demarcation Callout Strip
At the top of the schematic, the high-level circuit headers appear:
- **Left (A-End UNI):**
  - Indicator: Blue dot `●`
  - Origin Site: **`Jakarta Mega Pop Hub`**
  - Interface encapsulation badge: `VLAN 253 (Dot1Q)`
- **Center (Core Backbone):**
  - Indicator: Amber lightning bolt `⚡`
  - Core Type: **`EoMPLS Pseudowire Core (VCID: 100253)`**
- **Right (Z-End UNI):**
  - Indicator: Purple dot `●`
  - Termination Site: **`Surabaya Metro Gateway`**
  - Interface encapsulation badge: `VLAN 253 (Dot1Q)`

---

### 4.2 The 5-Hop Interactive Canvas
The canvas renders the end-to-end physical and logical equipment path with active laser animations:

```
[UNI-A] ──(Laser)── [Hop 1: NCS 540] ──(Trunk)── [Hop 2: ASR-9904] ──(DWDM)── [Hop 3: OSN 9800] ──(DWDM)── [Hop 4: ASR-9904] ──(Trunk)── [Hop 5: ACX5448] ──(Laser)── [UNI-Z]
```

#### Visual Breakdown of Each Node:
1. **A-End Demarcation Endpoint (UNI-A):**
   - Blue rounded icon labeled **`UNI-A`**.
   - Text: `Jakarta HQ` • Badge: `VLAN: 253` • Subtitle: `Customer Demarc`.
2. **Animated Optical Conduit (Laser):**
   - Flowing light beam with CSS animation (`animate-laser`) indicating active optical transmission.
3. **Hop #1 Card (`ID-CGK-METRO-AGG-01`):**
   - Category Badge: `Metro Demarcation` (Cyan gradient).
   - Port Tag: `TenGigE0/0/0.253 (VLAN 253 Dot1Q)` with green pulsing LED.
   - Speed Tag: `10G Committed`.
4. **Hop #2 Card (`ID-CGK-PE-RTR-01`):**
   - Category Badge: `Provider Edge (PE)` (Amber gradient).
   - Port Tag: `TenGigE0/0/1/0.253`.
   - **Attached Virtual Circuit (VCID):** Amber badge displaying:
     `⚡ PW-EVPL-CGK-SUB-VCID100253 [VCID: 100253]`.
5. **Hop #3 Card (`ID-CGK-DWDM-OPT-01`):**
   - Category Badge: `DWDM Transport` (Purple gradient).
   - Port Tag: `OTU4-1/1/1` (100G Optical Lambda).
   - Fiber Conduit: Long-Haul Java Optical Link (780 km).
6. **Hop #4 Card (`ID-SUB-PE-RTR-01`):**
   - Category Badge: `Provider Edge (PE)` (Amber gradient).
   - Port Tag: `TenGigE0/0/1/0.253`.
   - **Attached Virtual Circuit (VCID):** Amber badge displaying:
     `⚡ PW-EVPL-CGK-SUB-VCID100253 [VCID: 100253]`.
7. **Hop #5 Card (`ID-SUB-METRO-AGG-01`):**
   - Category Badge: `Metro Demarcation` (Cyan gradient).
   - Port Tag: `TenGigE0/0/0.253 (VLAN 253 Dot1Q)`.
   - Speed Tag: `10G Committed`.
8. **Z-End Demarcation Endpoint (UNI-Z):**
   - Purple rounded icon labeled **`UNI-Z`**.
   - Text: `Surabaya DR` • Badge: `VLAN: 253` • Subtitle: `Customer Demarc`.

---

### 4.3 Selected Hop Deep-Dive Inspector Panel
When the operator clicks on any hop card (e.g., Hop #2 or Hop #1):
- A glassmorphism deep-dive drawer expands below the canvas.
- Displays:
  - **Hostname:** `ID-CGK-PE-RTR-01`
  - **Hop Order:** `Hop Order #2`
  - **Active Interface:** `TenGigE0/0/1/0.253 (VCID: 100253)`
  - **Attached Virtual Circuit:** `PW-EVPL-CGK-SUB-VCID100253 (VCID: 100253)`
  - **Allocated Capacity:** `10000 Mbps CIR` (Committed Information Rate)

---

### 4.4 View Mode Switcher ("Resource Matrix" Tab)
By clicking the **"Resource Matrix"** button in the visualizer header:
- The display switches from the canvas to a telecom circuit cross-connect table:

| Hop # | Network Device | Port / Interface (VLAN) | Logical Circuit / VCID | Resource Role | Bandwidth |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **Hop 1** | `ID-CGK-METRO-AGG-01` | `TenGigE0/0/0.253 (VLAN 253 Dot1Q)` | — | `METRO_ACCESS_A_END` | **10 Gbps** |
| **Hop 2** | `ID-CGK-PE-RTR-01` | `TenGigE0/0/1/0.253` | `PW-EVPL-CGK-SUB-VCID100253` *(VCID: 100253)* | `PE_ROUTER_ORIGIN_VCID` | **10 Gbps** |
| **Hop 3** | `ID-CGK-DWDM-OPT-01` | `OTU4-1/1/1` | — | `DWDM_OPTICAL_TRANSPORT` | **10 Gbps** |
| **Hop 4** | `ID-SUB-PE-RTR-01` | `TenGigE0/0/1/0.253` | `PW-EVPL-CGK-SUB-VCID100253` *(VCID: 100253)* | `PE_ROUTER_TERMINATION_VCID` | **10 Gbps** |
| **Hop 5** | `ID-SUB-METRO-AGG-01` | `TenGigE0/0/0.253 (VLAN 253 Dot1Q)` | — | `METRO_ACCESS_Z_END` | **10 Gbps** |

---

## 5. Summary Checklist for Provisioning Engineers

| Step | Action | Verification |
| :---: | :--- | :--- |
| **1** | Register Logical Sub-Interfaces | Query `inv_device_ports` for `TenGigE0/0/0.253` on CGK and SUB nodes. |
| **2** | Create EoMPLS VNE | Verify `vne_name = PW-EVPL-CGK-SUB-VCID100253` with `vrf_name = VCID: 100253` and `vlan_id = 253`. |
| **3** | Provision Customer Service | Check `inv_services` for `SVC-ME-2026-0253` under customer `PT Bank Rakyat Indonesia (BRI) Tbk`. |
| **4** | Link Resource Mappings | Verify 5 records exist in `inv_service_resource_mappings` sorted in sequential `hop_order` (1 to 5). |
| **5** | Visual Schematic Audit | Open GUI at `http://localhost:3000/inventory`, select service, and verify 5 hops, laser conduits, and VCID badge. |
