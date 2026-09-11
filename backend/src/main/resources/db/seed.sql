-- ============================================================================
-- NETSTREAM TELECOM INVENTORY SEED DATA
-- ============================================================================

-- 1. Locations
INSERT INTO inventory.inv_locations (id, parent_id, code, name, type, latitude, longitude, address, contact_person, contact_phone, created_by, updated_by)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'ID-CGK', 'Jakarta Mega Pop Hub', 'SITE', -6.20880000, 106.84560000, 'Jl. Gatot Subroto Kav. 52, South Jakarta', 'Budi Santoso', '+62811234567', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ID-CGK-DC1', 'Data Center Facility 1', 'BUILDING', -6.20882000, 106.84565000, 'Building A, Fl. 3, Cyber Tech Park', 'Budi Santoso', '+62811234567', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ID-CGK-R01', 'Core Server Room 301', 'ROOM', -6.20883000, 106.84566000, 'Room 301 Suite B', 'Ahmad Dani', '+62812345678', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', NULL, 'ID-SUB', 'Surabaya Metro Gateway', 'SITE', -7.25750000, 112.75210000, 'Jl. Pemuda No. 18, Surabaya', 'Rini Indrawati', '+62813456789', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'ID-SUB-DC1', 'Surabaya Metro DC Facility', 'BUILDING', -7.25752000, 112.75215000, 'Building B, Fl. 2, Cyber East Park', 'Rini Indrawati', '+62813456789', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'ID-SUB-R01', 'Surabaya Core Server Room 201', 'ROOM', -7.25753000, 112.75216000, 'Room 201 Suite A', 'Rini Indrawati', '+62813456789', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', NULL, 'ID-BDG', 'Bandung Transit Hub', 'SITE', -6.91750000, 107.61910000, 'Jl. Asia Afrika No. 65, Bandung', 'Hendra Wijaya', '+62812345670', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'ID-BDG-DC1', 'Bandung DC Facility', 'BUILDING', -6.91752000, 107.61915000, 'Jl. Asia Afrika Fl. 2', 'Hendra Wijaya', '+62812345670', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'ID-BDG-R01', 'Bandung Core Server Room 101', 'ROOM', -6.91753000, 107.61916000, 'Room 101', 'Hendra Wijaya', '+62812345670', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', NULL, 'ID-MDN', 'Medan Regional Hub', 'SITE', 3.59520000, 98.67220000, 'Jl. Balai Kota No. 1, Medan', 'Faisal Nasution', '+62815678901', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'ID-MDN-DC1', 'Medan DC Facility', 'BUILDING', 3.59522000, 98.67225000, 'Sumatera Cyber Center Fl. 4', 'Faisal Nasution', '+62815678901', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'ID-MDN-R01', 'Medan Server Room 401', 'ROOM', 3.59523000, 98.67226000, 'Room 401', 'Faisal Nasution', '+62815678901', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', NULL, 'ID-SMG', 'Semarang Transit Hub', 'SITE', -6.96670000, 110.41670000, 'Jl. Pemuda No. 142, Semarang', 'Bambang Priyono', '+62816789012', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'ID-SMG-DC1', 'Semarang DC Facility', 'BUILDING', -6.96672000, 110.41675000, 'Jawa Tengah Cyber Tower Fl. 2', 'Bambang Priyono', '+62816789012', 'system', 'system'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'ID-SMG-R01', 'Semarang Server Room 201', 'ROOM', -6.96673000, 110.41676000, 'Room 201', 'Bambang Priyono', '+62816789012', 'system', 'system')
ON CONFLICT (code) DO NOTHING;

-- 2. Racks
INSERT INTO inventory.inv_racks (id, location_id, rack_number, height_units, max_power_watt, current_power_watt, max_weight_kg, status, created_by, updated_by)
VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RACK-A01', 42, 6000.00, 3200.00, 1000.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RACK-A02', 42, 6000.00, 2100.00, 1000.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RACK-A03', 42, 6000.00, 1800.00, 1000.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RACK-A04', 42, 6000.00, 1500.00, 1000.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'RACK-SUB-01', 42, 6000.00, 2800.00, 1000.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'RACK-SUB-02', 42, 6000.00, 2200.00, 1000.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'RACK-BDG-01', 42, 5000.00, 2400.00, 800.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'RACK-BDG-02', 42, 5000.00, 1900.00, 800.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'RACK-MDN-01', 42, 5000.00, 2100.00, 800.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'RACK-MDN-02', 42, 5000.00, 1600.00, 800.00, 'ACTIVE', 'system', 'system'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'RACK-SMG-01', 42, 5000.00, 1800.00, 800.00, 'ACTIVE', 'system', 'system')
ON CONFLICT (location_id, rack_number) DO NOTHING;

-- 2.1 Device Types Lookup Catalog
INSERT INTO inventory.inv_device_types (code, name, category, description, is_active, display_order)
VALUES
('ROUTER', 'Core / Edge Router', 'L3_ROUTING', 'Layer 3 Core and Provider Edge backbone routing chassis', TRUE, 1),
('SWITCH', 'Data Center Switch', 'L2_L3_SWITCHING', 'Data Center leaf-spine and core aggregation switches', TRUE, 2),
('DWDM_CHASSIS', 'DWDM Optical Transport', 'OPTICAL', 'Dense Wavelength Division Multiplexing optical transport chassis', TRUE, 3),
('OLT', 'GPON / XGS-PON OLT', 'ACCESS_PON', 'Optical Line Terminal for FTTH/FTTB gigabit access networks', TRUE, 4),
('METRO', 'Metro Ethernet / Aggregation Switch', 'METRO_ACCESS', 'Carrier Ethernet metro aggregation and access demarcation node', TRUE, 5),
('FIREWALL', 'NextGen Firewall', 'SECURITY', 'Next-Generation Firewall and enterprise security gateway', TRUE, 6),
('SERVER', 'Hypervisor Server', 'COMPUTE', 'Compute hypervisor host running virtual network appliances (VNFs)', TRUE, 7),
('DSLAM', 'DSLAM Access Node', 'ACCESS_COPPER', 'Digital Subscriber Line Access Multiplexer broadband access', TRUE, 8),
('ODF', 'Optical Distribution Frame (ODF)', 'PASSIVE_OPTICAL', 'High-density fiber optic cable termination and distribution frame', TRUE, 9),
('DDF', 'Digital Distribution Frame (DDF)', 'PASSIVE_COPPER', 'Digital distribution frame for TDM/E1/DS3 cross-connects', TRUE, 10),
('PATCH_PANEL', 'Fiber / Copper Patch Panel', 'PASSIVE', 'Standard rack-mount patch panel interconnect', TRUE, 11)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- 3. Devices
INSERT INTO inventory.inv_network_devices (id, rack_id, location_id, hostname, serial_number, asset_tag, device_type, vendor, model, hardware_version, firmware_version, rack_unit_start, rack_unit_height, status, management_ip, total_ports, cost_usd, created_by, updated_by)
VALUES
-- Original Baseline
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-PE-RTR-01', 'FOC2341X09A', 'AST-CGK-001', 'ROUTER', 'Cisco', 'ASR-9904', 'V02', 'IOS-XR 7.9.2', 38, 4, 'ACTIVE', '10.240.10.1', 32, 45000.00, 'system', 'system'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-CORE-SW-01', 'FOX1928001B', 'AST-CGK-002', 'SWITCH', 'Juniper', 'QFX10002-60C', 'Rev 03', 'Junos 22.4R1', 34, 2, 'ACTIVE', '10.240.10.2', 60, 28000.00, 'system', 'system'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-DWDM-OPT-01', 'HW882910398', 'AST-CGK-003', 'DWDM_CHASSIS', 'Huawei', 'OptiX OSN 9800', 'HW-V3', 'V100R021C10', 20, 8, 'ACTIVE', '10.240.10.3', 96, 75000.00, 'system', 'system'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'ID-SUB-PE-RTR-01', 'FOC2341X09B', 'AST-SUB-001', 'ROUTER', 'Cisco', 'ASR-9904', 'V02', 'IOS-XR 7.9.2', 38, 4, 'ACTIVE', '10.240.20.1', 32, 45000.00, 'system', 'system'),

-- 10 Routers
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-CORE-RTR-01', 'FOC2401A011', 'AST-RTR-001', 'ROUTER', 'Cisco', 'ASR-9912', 'V03', 'IOS-XR 7.10.1', 30, 8, 'ACTIVE', '10.240.10.11', 64, 85000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380102', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-PE-RTR-02', 'FOC2401A012', 'AST-RTR-002', 'ROUTER', 'Cisco', 'ASR-9904', 'V02', 'IOS-XR 7.9.2', 22, 4, 'ACTIVE', '10.240.10.12', 32, 45000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380103', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-BNG-RTR-01', 'JN1189201A', 'AST-RTR-003', 'ROUTER', 'Juniper', 'MX960', 'Rev 05', 'Junos 23.2R1', 10, 16, 'ACTIVE', '10.240.10.13', 96, 110000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380104', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ID-SUB-CORE-RTR-01', 'JN1189202B', 'AST-RTR-004', 'ROUTER', 'Juniper', 'MX480', 'Rev 04', 'Junos 23.1R2', 30, 8, 'ACTIVE', '10.240.20.11', 48, 65000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380105', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ID-SUB-PE-RTR-02', 'FOC2401A015', 'AST-RTR-005', 'ROUTER', 'Cisco', 'ASR-9904', 'V02', 'IOS-XR 7.9.2', 24, 4, 'ACTIVE', '10.240.20.12', 32, 45000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380106', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'ID-BDG-CORE-RTR-01', 'HW219901A1', 'AST-RTR-006', 'ROUTER', 'Huawei', 'NetEngine 8000 X8', 'V3.0', 'V800R021C00', 28, 10, 'ACTIVE', '10.240.30.11', 64, 78000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380107', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'ID-BDG-PE-RTR-01', 'HW219901A2', 'AST-RTR-007', 'ROUTER', 'Huawei', 'NE40E-X8A', 'V2.1', 'V800R019C10', 18, 8, 'ACTIVE', '10.240.30.12', 48, 52000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380108', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'ID-MDN-CORE-RTR-01', 'NOK8810201', 'AST-RTR-008', 'ROUTER', 'Nokia', '7750 SR-12e', 'H01', 'TiMOS-23.7.R1', 26, 12, 'ACTIVE', '10.240.40.11', 72, 92000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380109', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'ID-MDN-PE-RTR-01', 'NOK8810202', 'AST-RTR-009', 'ROUTER', 'Nokia', '7750 SR-7s', 'H02', 'TiMOS-23.7.R1', 16, 6, 'ACTIVE', '10.240.40.12', 36, 48000.00, 'system', 'system'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380110', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'ID-SMG-PE-RTR-01', 'FOC2401A020', 'AST-RTR-010', 'ROUTER', 'Cisco', 'Cisco 8808', 'V01', 'IOS-XR 7.9.1', 25, 8, 'ACTIVE', '10.240.50.11', 64, 72000.00, 'system', 'system'),

-- 10 OLTs
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380201', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-GPON-OLT-01', 'HW-OLT-8801', 'AST-OLT-001', 'OLT', 'Huawei', 'SmartAX MA5800-X17', 'H901BPSB', 'MA5800V100R021C00', 6, 11, 'ACTIVE', '10.240.10.31', 256, 35000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380202', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-XGSPON-OLT-02', 'HW-OLT-8802', 'AST-OLT-002', 'OLT', 'Huawei', 'SmartAX MA5800-X7', 'H901MPSC', 'MA5800V100R021C00', 28, 6, 'ACTIVE', '10.240.10.32', 128, 28000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380203', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-GPON-OLT-03', 'ZT-OLT-7701', 'AST-OLT-003', 'OLT', 'ZTE', 'ZXA10 C600', 'V2.1', 'ZXA10-V1.2.1', 1, 11, 'ACTIVE', '10.240.10.33', 256, 34000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380204', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ID-SUB-GPON-OLT-01', 'HW-OLT-8803', 'AST-OLT-004', 'OLT', 'Huawei', 'SmartAX MA5800-X17', 'H901BPSB', 'MA5800V100R021C00', 12, 11, 'ACTIVE', '10.240.20.31', 256, 35000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380205', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ID-SUB-XGSPON-OLT-02', 'ZT-OLT-7702', 'AST-OLT-005', 'OLT', 'ZTE', 'ZXA10 C600', 'V2.1', 'ZXA10-V1.2.1', 24, 11, 'ACTIVE', '10.240.20.32', 256, 34000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380206', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'ID-BDG-GPON-OLT-01', 'NK-OLT-6601', 'AST-OLT-006', 'OLT', 'Nokia', '7360 ISAM FX-16', 'Rev D', 'R6.2.04', 20, 14, 'ACTIVE', '10.240.30.31', 256, 38000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380207', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'ID-BDG-GPON-OLT-02', 'NK-OLT-6602', 'AST-OLT-007', 'OLT', 'Nokia', '7360 ISAM FX-8', 'Rev C', 'R6.2.04', 10, 8, 'ACTIVE', '10.240.30.32', 128, 24000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380208', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'ID-MDN-GPON-OLT-01', 'FH-OLT-5501', 'AST-OLT-008', 'OLT', 'FiberHome', 'AN5516-01', 'V1.0', 'RP1000', 22, 12, 'ACTIVE', '10.240.40.31', 256, 31000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380209', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'ID-MDN-XGSPON-OLT-02', 'ZT-OLT-7703', 'AST-OLT-009', 'OLT', 'ZTE', 'ZXA10 C300', 'V2.0', 'ZXA10-V2.1.0', 8, 10, 'ACTIVE', '10.240.40.32', 128, 26000.00, 'system', 'system'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380210', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'ID-SMG-GPON-OLT-01', 'HW-OLT-8804', 'AST-OLT-010', 'OLT', 'Huawei', 'SmartAX MA5800-X7', 'H901MPSC', 'MA5800V100R021C00', 15, 6, 'ACTIVE', '10.240.50.31', 128, 28000.00, 'system', 'system'),

-- 10 Metro
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380301', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-METRO-AGG-01', 'CS-MTR-9001', 'AST-MTR-001', 'METRO', 'Cisco', 'NCS 540', 'V01', 'IOS-XR 7.8.2', 30, 2, 'ACTIVE', '10.240.10.51', 48, 18500.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380302', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-METRO-AGG-02', 'CS-MTR-9002', 'AST-MTR-002', 'METRO', 'Cisco', 'ASR 920', 'V02', 'IOS-XE 17.6.3', 28, 1, 'ACTIVE', '10.240.10.52', 24, 12000.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380303', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ID-CGK-METRO-ACC-01', 'HW-MTR-8001', 'AST-MTR-003', 'METRO', 'Huawei', 'CX600-X8', 'V3.0', 'V800R012C10', 24, 6, 'ACTIVE', '10.240.10.53', 64, 22000.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380304', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ID-SUB-METRO-AGG-01', 'JN-MTR-7001', 'AST-MTR-004', 'METRO', 'Juniper', 'ACX5448', 'Rev 02', 'Junos 22.3R1', 20, 1, 'ACTIVE', '10.240.20.51', 48, 19000.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380305', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ID-SUB-METRO-ACC-02', 'HW-MTR-8002', 'AST-MTR-005', 'METRO', 'Huawei', 'ATN 980B', 'V2.0', 'V800R012C10', 8, 4, 'ACTIVE', '10.240.20.52', 32, 15500.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380306', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'ID-BDG-METRO-AGG-01', 'CN-MTR-6001', 'AST-MTR-006', 'METRO', 'Ciena', '3928 Service Delivery Switch', 'V1.2', 'SAOS 8.6.5', 6, 1, 'ACTIVE', '10.240.30.51', 24, 11500.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380307', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'ID-BDG-METRO-ACC-02', 'JN-MTR-7002', 'AST-MTR-007', 'METRO', 'Juniper', 'ACX710 Universal Metro', 'Rev 01', 'Junos 22.4R1', 4, 1, 'ACTIVE', '10.240.30.52', 24, 13000.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380308', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'ID-MDN-METRO-AGG-01', 'NK-MTR-5001', 'AST-MTR-008', 'METRO', 'Nokia', '7250 IXR-e', 'H01', 'SR OS 23.5', 4, 2, 'ACTIVE', '10.240.40.51', 32, 16000.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380309', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'ID-MDN-METRO-ACC-02', 'ZT-MTR-4001', 'AST-MTR-009', 'METRO', 'ZTE', 'ZXCTN 6180H', 'V2.0', 'ZXCTN-V3.20', 1, 3, 'ACTIVE', '10.240.40.52', 24, 12500.00, 'system', 'system'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380310', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'ID-SMG-METRO-AGG-01', 'EC-MTR-3001', 'AST-MTR-010', 'METRO', 'Edgecore', 'AS5916-54XKS', 'V01', 'SONiC 2023.11', 6, 1, 'ACTIVE', '10.240.50.51', 54, 14000.00, 'system', 'system')
ON CONFLICT (hostname) DO NOTHING;

-- 4. Ports
INSERT INTO inventory.inv_device_ports (id, device_id, port_name, port_speed_mbps, medium_type, connector_type, is_operational, is_allocated)
VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'HundredGigE0/0/0/0', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'HundredGigE0/0/0/1', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'TenGigE0/0/1/0', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, FALSE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'HundredGigE0/0/0/0', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
-- DWDM Chassis Ports
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'OTU4-1/1/1', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'OTU4-1/1/2', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, FALSE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'OTU4-1/1/3', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, FALSE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'OTU4-1/1/4', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, FALSE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '100GE-Client-1/2/1', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d06', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '100GE-Client-1/2/2', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, FALSE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d07', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '10GE-Client-1/3/1', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, FALSE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d08', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '10GE-Client-1/3/2', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, FALSE),
-- Metro Ethernet VLAN & VCID Sub-interfaces
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380301', 'TenGigE0/0/0.250 (VLAN 250 Dot1Q)', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'TenGigE0/0/1/0.250 (VCID: 250025)', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'TenGigE0/0/1/0.250 (VCID: 250025)', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380304', 'TenGigE0/0/0.250 (VLAN 250 Dot1Q)', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE)
ON CONFLICT (device_id, port_name) DO NOTHING;

-- 5. Virtual Network Elements
INSERT INTO inventory.inv_virtual_network_elements (id, hypervisor_device_id, vne_name, vnf_type, vlan_id, vrf_name, allocated_vcpu, allocated_ram_gb, allocated_disk_gb, status, created_by, updated_by)
VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'vRouter-BankMandiri-CGK', 'vRouter-CSR1000v', 2100, 'VRF_MANDIRI_PROD', 8, 16, 120, 'ACTIVE', 'system', 'system'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'vFW-Enterprise-Edge-01', 'vFortiGate-VM', 2105, 'VRF_SECURITY_EDGE', 4, 8, 60, 'ACTIVE', 'system', 'system'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'PW-EVPL-CGK-SUB-VCID250025', 'EoMPLS_PW_L2CIRCUIT', 250, 'VCID: 250025', 4, 8, 40, 'ACTIVE', 'system', 'system')
ON CONFLICT (vne_name) DO NOTHING;

-- 6. Services
INSERT INTO inventory.inv_services (id, service_code, customer_name, service_type, bandwidth_mbps, sla_tier, sla_availability_pct, monthly_recurring_cost, status, a_end_location_id, z_end_location_id, activation_date, created_by, updated_by)
VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'SVC-MPLS-2026-0091', 'Bank Mandiri Tbk', 'L3_VPN_MPLS', 10000, 'GOLD', 99.99, 12500.00, 'ACTIVE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', CURRENT_TIMESTAMP - INTERVAL '30 days', 'system', 'system'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'SVC-DIA-2026-0044', 'Telkomsel Enterprise', 'INTERNET_DIRECT', 40000, 'PLATINUM', 99.99, 28000.00, 'ACTIVE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_TIMESTAMP - INTERVAL '15 days', 'system', 'system'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'SVC-ME-2026-0250', 'PT Bank Central Asia (BCA) Tbk', 'METRO_ETHERNET', 2000, 'PLATINUM', 99.99, 8500.00, 'ACTIVE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', CURRENT_TIMESTAMP - INTERVAL '7 days', 'system', 'system')
ON CONFLICT (service_code) DO NOTHING;

-- 7. Service Resource Mappings
INSERT INTO inventory.inv_service_resource_mappings (id, service_id, device_id, port_id, vne_id, resource_role, hop_order, allocated_bandwidth_mbps)
VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NULL, 'PE_ROUTER_ORIGIN', 1, 10000),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', NULL, 'DWDM_OPTICAL_TRANSPORT', 2, 10000),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', NULL, 'PE_ROUTER_TERMINATION', 3, 10000),
-- 2.1 Device Types Lookup Catalog
INSERT INTO inventory.inv_device_types (code, name, category, description, is_active, display_order)
VALUES
('ROUTER', 'Core / Edge Router', 'L3_ROUTING', 'Layer 3 Core and Provider Edge backbone routing chassis', TRUE, 1),
('SWITCH', 'Data Center Switch', 'L2_L3_SWITCHING', 'Data Center leaf-spine and core aggregation switches', TRUE, 2),
('DWDM_CHASSIS', 'DWDM Optical Transport', 'OPTICAL', 'Dense Wavelength Division Multiplexing optical transport chassis', TRUE, 3),
('OLT', 'GPON / XGS-PON OLT', 'ACCESS_PON', 'Optical Line Terminal for FTTH/FTTB gigabit access networks', TRUE, 4),
('METRO', 'Metro Ethernet / Aggregation Switch', 'METRO_ACCESS', 'Carrier Ethernet metro aggregation and access demarcation node', TRUE, 5),
('FIREWALL', 'NextGen Firewall', 'SECURITY', 'Next-Generation Firewall and enterprise security gateway', TRUE, 6),
('SERVER', 'Hypervisor Server', 'COMPUTE', 'Compute hypervisor host running virtual network appliances (VNFs)', TRUE, 7),
('DSLAM', 'DSLAM Access Node', 'ACCESS_COPPER', 'Digital Subscriber Line Access Multiplexer broadband access', TRUE, 8),
('ODF', 'Optical Distribution Frame (ODF)', 'PASSIVE_OPTICAL', 'High-density fiber optic cable termination and distribution frame', TRUE, 9),
('DDF', 'Digital Distribution Frame (DDF)', 'PASSIVE_COPPER', 'Digital distribution frame for TDM/E1/DS3 cross-connects', TRUE, 10),
('PATCH_PANEL', 'Fiber / Copper Patch Panel', 'PASSIVE', 'Standard rack-mount patch panel interconnect', TRUE, 11),
('ODC', 'Optical Distribution Cabinet (ODC)', 'PASSIVE_OPTICAL', 'Outdoor street distribution cabinet for feeder-to-distribution fiber cable cross-connect', TRUE, 12),
('ODP', 'Optical Distribution Point (ODP)', 'PASSIVE_OPTICAL', 'Pole or wall mount optical distribution point with integrated PLC splitter for customer drop cables', TRUE, 13),
('CLOSURE', 'Fiber Optic Splice Closure (FOSC)', 'PASSIVE_OPTICAL', 'Underground manhole or aerial inline fiber optic splice enclosure', TRUE, 14),
('SPLITTER_BOX', 'PLC Optical Splitter Box', 'PASSIVE_OPTICAL', 'Passive optical power splitter module (1:4, 1:8, 1:16, 1:32)', TRUE, 15),
('ONT', 'Optical Network Terminal (ONT)', 'ACCESS_CPE', 'Customer premises optical broadband modem and gigabit gateway', TRUE, 16)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- 3. Passive & Active Devices
INSERT INTO inventory.inv_network_devices (id, rack_id, location_id, hostname, serial_number, asset_tag, device_type, vendor, model, hardware_version, firmware_version, rack_unit_start, rack_unit_height, status, management_ip, total_ports, cost_usd, created_by, updated_by)
VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ODF-CGK-R01-01', 'ODF-144-CGK-001', 'AST-ODF-001', 'ODF', 'CommScope', 'FL2000 144-Core High-Density ODF', '4U Chassis', NULL, 36, 4, 'ACTIVE', NULL, 144, 4500.00, 'system', 'system'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FOSC-CGK-MH04', 'FOSC-450D-96C', 'AST-FOSC-004', 'CLOSURE', 'Raychem / CommScope', 'FOSC-450-D6 Dome Splice Closure 96-Core', 'IP68 Gel Seal', NULL, NULL, 0, 'ACTIVE', NULL, 96, 1200.00, 'system', 'system'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', NULL, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ODC-CGK-CBD-01', 'ODC-288-SCBD-01', 'AST-ODC-001', 'ODC', 'Huawei', 'ODN FDT-288 Outdoor Street Cabinet', 'IP65 Stainless', NULL, NULL, 0, 'ACTIVE', NULL, 288, 6800.00, 'system', 'system'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', NULL, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ODP-CGK-TLT-01', 'ODP-16-TLT-001', 'AST-ODP-001', 'ODP', 'Corning', 'OptiSheath 16-Port FAT with 1:8 PLC Splitter', 'IP65 Wall Mount', NULL, NULL, 0, 'ACTIVE', NULL, 16, 450.00, 'system', 'system'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', NULL, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ONT-TLT-FL18-01', 'HG8245H-2026-991', 'AST-ONT-001', 'ONT', 'Huawei', 'EchoLife HG8245H GPON Gigabit ONT', 'Rev C', 'V5R019C20', NULL, 0, 'ACTIVE', '192.168.100.1', 4, 150.00, 'system', 'system'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ODF-SUB-R01-01', 'ODF-144-SUB-001', 'AST-ODF-002', 'ODF', 'CommScope', 'FL2000 144-Core High-Density ODF', '4U Chassis', NULL, 36, 4, 'ACTIVE', NULL, 144, 4500.00, 'system', 'system')
ON CONFLICT (id) DO NOTHING;

-- 4. Passive Ports
INSERT INTO inventory.inv_device_ports (id, device_id, port_name, port_speed_mbps, medium_type, connector_type, is_operational, is_allocated)
VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Tray-1/Port-12 (Feeder CBL-FDR-CGK-48C Core #12 Aqua)', 2500, 'FIBER_SINGLE_MODE', 'SC/APC', TRUE, TRUE),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Tray-1/Port-1 (Backbone Trunk CBL-TRK-01 Core #1 Blue)', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', TRUE, TRUE),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Splice-Tray-1/Core-12 (Feeder-to-Dist Joint)', 2500, 'FIBER_SINGLE_MODE', 'FUSION_SPLICE', TRUE, TRUE),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Splitter-1:4/Out-2 (CBL-DIST-SCBD-24C Core #3 Green)', 2500, 'FIBER_SINGLE_MODE', 'SC/APC', TRUE, TRUE),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Drop-Port-4 (1:8 PLC Splitter • CBL-DROP-TLT-02C Core #1 Blue)', 2500, 'FIBER_SINGLE_MODE', 'SC/APC', TRUE, TRUE),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'GE-LAN1 (Customer Demarcation Gigabit Port)', 1000, 'COPPER_RJ45', 'RJ45', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. GPON Service
INSERT INTO inventory.inv_services (id, service_code, customer_name, service_type, bandwidth_mbps, sla_tier, sla_availability_pct, monthly_recurring_cost, status, a_end_location_id, z_end_location_id, activation_date, created_by, updated_by)
VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380888', 'SVC-GPON-2026-0888', 'PT Telkom Landmark Tower (Enterprise FTTO / Gigabit Broadband)', 'GPON_BROADBAND', 1000, 'GOLD', 99.95, 2450.00, 'ACTIVE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_TIMESTAMP - INTERVAL '3 days', 'system', 'system')
ON CONFLICT (service_code) DO NOTHING;

-- 7. GPON 6-Hop Resource Mappings
INSERT INTO inventory.inv_service_resource_mappings (id, service_id, device_id, port_id, vne_id, resource_role, hop_order, allocated_bandwidth_mbps)
VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380881', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380888', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380206', '3a65453c-6058-5181-98ba-21cd86075d0b', NULL, 'OLT_GPON_LINE_PORT (Patch Cord: PC-SM-SC-LC-01 • 1.5m)', 1, 2500),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380882', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380888', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', NULL, 'ODF_INTERNAL_CROSS_CONNECT (Feeder: CBL-FDR-CGK-48C • Core #12 Aqua • 1.8 km)', 2, 2500),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380883', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380888', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', NULL, 'FOSC_SPLICE_TRAY (Feeder-to-Dist Joint • Core #12 Splice • 0.9 km)', 3, 2500),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380884', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380888', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', NULL, 'ODC_FEEDER_SPLITTER (1:4 PLC Splitter • Dist: CBL-DIST-SCBD-24C • Core #3 Green • 0.6 km)', 4, 2500),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380885', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380888', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380005', NULL, 'ODP_DISTRIBUTION_DROP (1:8 PLC Splitter • Drop: CBL-DROP-TLT-02C • Core #1 Blue • 65 m)', 5, 1000),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380886', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380888', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', NULL, 'CUSTOMER_PREMISES_ONT (1 Gbps Symmetrical Fiber Broadband)', 6, 1000)
ON CONFLICT DO NOTHING;
