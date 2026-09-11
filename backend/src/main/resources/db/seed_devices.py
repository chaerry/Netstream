import pg8000.native
import uuid

con = pg8000.native.Connection(
    user='n8n',
    password='rahasia',
    host='145.79.8.141',
    port=5433,
    database='netstream'
)

# 1. Update Enum
con.run("ALTER TYPE inventory.device_type ADD VALUE IF NOT EXISTS 'METRO';")

# 2. Insert Additional Locations & Hierarchy
locations = [
    # Bandung
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', None, 'ID-BDG', 'Bandung Transit Hub', 'SITE', -6.91750000, 107.61910000, 'Jl. Asia Afrika No. 65, Bandung', 'Hendra Wijaya', '+62812345670'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'ID-BDG-DC1', 'Bandung DC Facility', 'BUILDING', -6.91752000, 107.61915000, 'Jl. Asia Afrika Fl. 2', 'Hendra Wijaya', '+62812345670'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'ID-BDG-R01', 'Bandung Core Server Room 101', 'ROOM', -6.91753000, 107.61916000, 'Room 101', 'Hendra Wijaya', '+62812345670'),
    
    # Surabaya Server Room
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'ID-SUB-DC1', 'Surabaya Metro DC Facility', 'BUILDING', -7.25752000, 112.75215000, 'Building B, Fl. 2, Cyber East Park', 'Rini Indrawati', '+62813456789'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'ID-SUB-R01', 'Surabaya Core Server Room 201', 'ROOM', -7.25753000, 112.75216000, 'Room 201 Suite A', 'Rini Indrawati', '+62813456789'),

    # Medan
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', None, 'ID-MDN', 'Medan Regional Hub', 'SITE', 3.59520000, 98.67220000, 'Jl. Balai Kota No. 1, Medan', 'Faisal Nasution', '+62815678901'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'ID-MDN-DC1', 'Medan DC Facility', 'BUILDING', 3.59522000, 98.67225000, 'Sumatera Cyber Center Fl. 4', 'Faisal Nasution', '+62815678901'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'ID-MDN-R01', 'Medan Server Room 401', 'ROOM', 3.59523000, 98.67226000, 'Room 401', 'Faisal Nasution', '+62815678901'),

    # Semarang
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', None, 'ID-SMG', 'Semarang Transit Hub', 'SITE', -6.96670000, 110.41670000, 'Jl. Pemuda No. 142, Semarang', 'Bambang Priyono', '+62816789012'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'ID-SMG-DC1', 'Semarang DC Facility', 'BUILDING', -6.96672000, 110.41675000, 'Jawa Tengah Cyber Tower Fl. 2', 'Bambang Priyono', '+62816789012'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'ID-SMG-R01', 'Semarang Server Room 201', 'ROOM', -6.96673000, 110.41676000, 'Room 201', 'Bambang Priyono', '+62816789012'),
]

for loc in locations:
    con.run("""
        INSERT INTO inventory.inv_locations (id, parent_id, code, name, type, latitude, longitude, address, contact_person, contact_phone, created_by, updated_by)
        VALUES (:id, :parent_id, :code, :name, CAST(:type AS inventory.location_type), :lat, :lng, :address, :contact, :phone, 'system', 'system')
        ON CONFLICT (code) DO NOTHING;
    """, id=loc[0], parent_id=loc[1], code=loc[2], name=loc[3], type=loc[4], lat=loc[5], lng=loc[6], address=loc[7], contact=loc[8], phone=loc[9])

# 3. Insert Racks
racks = [
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RACK-A03', 42, 6000.00, 1800.00, 1000.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RACK-A04', 42, 6000.00, 1500.00, 1000.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'RACK-BDG-01', 42, 5000.00, 2400.00, 800.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'RACK-BDG-02', 42, 5000.00, 1900.00, 800.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'RACK-SUB-01', 42, 6000.00, 2800.00, 1000.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'RACK-SUB-02', 42, 6000.00, 2200.00, 1000.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'RACK-MDN-01', 42, 5000.00, 2100.00, 800.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'RACK-MDN-02', 42, 5000.00, 1600.00, 800.00, 'ACTIVE'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'RACK-SMG-01', 42, 5000.00, 1800.00, 800.00, 'ACTIVE'),
]

for r in racks:
    con.run("""
        INSERT INTO inventory.inv_racks (id, location_id, rack_number, height_units, max_power_watt, current_power_watt, max_weight_kg, status, created_by, updated_by)
        VALUES (:id, :location_id, :rack_number, :height, :max_p, :cur_p, :max_w, :status, 'system', 'system')
        ON CONFLICT (location_id, rack_number) DO NOTHING;
    """, id=r[0], location_id=r[1], rack_number=r[2], height=r[3], max_p=r[4], cur_p=r[5], max_w=r[6], status=r[7])

# 4. Insert Devices (10 ROUTER, 10 OLT, 10 METRO)
devices = [
    # ---------------- 10 ROUTERS ----------------
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380101',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-CORE-RTR-01',
        'serial_number': 'FOC2401A011',
        'asset_tag': 'AST-RTR-001',
        'device_type': 'ROUTER',
        'vendor': 'Cisco',
        'model': 'ASR-9912',
        'hardware_version': 'V03',
        'firmware_version': 'IOS-XR 7.10.1',
        'rack_unit_start': 30,
        'rack_unit_height': 8,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.11',
        'total_ports': 64,
        'cost_usd': 85000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380102',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-PE-RTR-02',
        'serial_number': 'FOC2401A012',
        'asset_tag': 'AST-RTR-002',
        'device_type': 'ROUTER',
        'vendor': 'Cisco',
        'model': 'ASR-9904',
        'hardware_version': 'V02',
        'firmware_version': 'IOS-XR 7.9.2',
        'rack_unit_start': 22,
        'rack_unit_height': 4,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.12',
        'total_ports': 32,
        'cost_usd': 45000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380103',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-BNG-RTR-01',
        'serial_number': 'JN1189201A',
        'asset_tag': 'AST-RTR-003',
        'device_type': 'ROUTER',
        'vendor': 'Juniper',
        'model': 'MX960',
        'hardware_version': 'Rev 05',
        'firmware_version': 'Junos 23.2R1',
        'rack_unit_start': 10,
        'rack_unit_height': 16,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.13',
        'total_ports': 96,
        'cost_usd': 110000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380104',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        'hostname': 'ID-SUB-CORE-RTR-01',
        'serial_number': 'JN1189202B',
        'asset_tag': 'AST-RTR-004',
        'device_type': 'ROUTER',
        'vendor': 'Juniper',
        'model': 'MX480',
        'hardware_version': 'Rev 04',
        'firmware_version': 'Junos 23.1R2',
        'rack_unit_start': 30,
        'rack_unit_height': 8,
        'status': 'ACTIVE',
        'management_ip': '10.240.20.11',
        'total_ports': 48,
        'cost_usd': 65000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380105',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        'hostname': 'ID-SUB-PE-RTR-02',
        'serial_number': 'FOC2401A015',
        'asset_tag': 'AST-RTR-005',
        'device_type': 'ROUTER',
        'vendor': 'Cisco',
        'model': 'ASR-9904',
        'hardware_version': 'V02',
        'firmware_version': 'IOS-XR 7.9.2',
        'rack_unit_start': 24,
        'rack_unit_height': 4,
        'status': 'ACTIVE',
        'management_ip': '10.240.20.12',
        'total_ports': 32,
        'cost_usd': 45000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380106',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
        'hostname': 'ID-BDG-CORE-RTR-01',
        'serial_number': 'HW219901A1',
        'asset_tag': 'AST-RTR-006',
        'device_type': 'ROUTER',
        'vendor': 'Huawei',
        'model': 'NetEngine 8000 X8',
        'hardware_version': 'V3.0',
        'firmware_version': 'V800R021C00',
        'rack_unit_start': 28,
        'rack_unit_height': 10,
        'status': 'ACTIVE',
        'management_ip': '10.240.30.11',
        'total_ports': 64,
        'cost_usd': 78000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380107',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
        'hostname': 'ID-BDG-PE-RTR-01',
        'serial_number': 'HW219901A2',
        'asset_tag': 'AST-RTR-007',
        'device_type': 'ROUTER',
        'vendor': 'Huawei',
        'model': 'NE40E-X8A',
        'hardware_version': 'V2.1',
        'firmware_version': 'V800R019C10',
        'rack_unit_start': 18,
        'rack_unit_height': 8,
        'status': 'ACTIVE',
        'management_ip': '10.240.30.12',
        'total_ports': 48,
        'cost_usd': 52000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380108',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        'hostname': 'ID-MDN-CORE-RTR-01',
        'serial_number': 'NOK8810201',
        'asset_tag': 'AST-RTR-008',
        'device_type': 'ROUTER',
        'vendor': 'Nokia',
        'model': '7750 SR-12e',
        'hardware_version': 'H01',
        'firmware_version': 'TiMOS-23.7.R1',
        'rack_unit_start': 26,
        'rack_unit_height': 12,
        'status': 'ACTIVE',
        'management_ip': '10.240.40.11',
        'total_ports': 72,
        'cost_usd': 92000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380109',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        'hostname': 'ID-MDN-PE-RTR-01',
        'serial_number': 'NOK8810202',
        'asset_tag': 'AST-RTR-009',
        'device_type': 'ROUTER',
        'vendor': 'Nokia',
        'model': '7750 SR-7s',
        'hardware_version': 'H02',
        'firmware_version': 'TiMOS-23.7.R1',
        'rack_unit_start': 16,
        'rack_unit_height': 6,
        'status': 'ACTIVE',
        'management_ip': '10.240.40.12',
        'total_ports': 36,
        'cost_usd': 48000.00
    },
    {
        'id': 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380110',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33',
        'hostname': 'ID-SMG-PE-RTR-01',
        'serial_number': 'FOC2401A020',
        'asset_tag': 'AST-RTR-010',
        'device_type': 'ROUTER',
        'vendor': 'Cisco',
        'model': 'Cisco 8808',
        'hardware_version': 'V01',
        'firmware_version': 'IOS-XR 7.9.1',
        'rack_unit_start': 25,
        'rack_unit_height': 8,
        'status': 'ACTIVE',
        'management_ip': '10.240.50.11',
        'total_ports': 64,
        'cost_usd': 72000.00
    },

    # ---------------- 10 OLTS ----------------
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380201',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-GPON-OLT-01',
        'serial_number': 'HW-OLT-8801',
        'asset_tag': 'AST-OLT-001',
        'device_type': 'OLT',
        'vendor': 'Huawei',
        'model': 'SmartAX MA5800-X17',
        'hardware_version': 'H901BPSB',
        'firmware_version': 'MA5800V100R021C00',
        'rack_unit_start': 6,
        'rack_unit_height': 11,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.31',
        'total_ports': 256,
        'cost_usd': 35000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380202',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-XGSPON-OLT-02',
        'serial_number': 'HW-OLT-8802',
        'asset_tag': 'AST-OLT-002',
        'device_type': 'OLT',
        'vendor': 'Huawei',
        'model': 'SmartAX MA5800-X7',
        'hardware_version': 'H901MPSC',
        'firmware_version': 'MA5800V100R021C00',
        'rack_unit_start': 28,
        'rack_unit_height': 6,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.32',
        'total_ports': 128,
        'cost_usd': 28000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380203',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-GPON-OLT-03',
        'serial_number': 'ZT-OLT-7701',
        'asset_tag': 'AST-OLT-003',
        'device_type': 'OLT',
        'vendor': 'ZTE',
        'model': 'ZXA10 C600',
        'hardware_version': 'V2.1',
        'firmware_version': 'ZXA10-V1.2.1',
        'rack_unit_start': 1,
        'rack_unit_height': 11,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.33',
        'total_ports': 256,
        'cost_usd': 34000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380204',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        'hostname': 'ID-SUB-GPON-OLT-01',
        'serial_number': 'HW-OLT-8803',
        'asset_tag': 'AST-OLT-004',
        'device_type': 'OLT',
        'vendor': 'Huawei',
        'model': 'SmartAX MA5800-X17',
        'hardware_version': 'H901BPSB',
        'firmware_version': 'MA5800V100R021C00',
        'rack_unit_start': 12,
        'rack_unit_height': 11,
        'status': 'ACTIVE',
        'management_ip': '10.240.20.31',
        'total_ports': 256,
        'cost_usd': 35000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380205',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        'hostname': 'ID-SUB-XGSPON-OLT-02',
        'serial_number': 'ZT-OLT-7702',
        'asset_tag': 'AST-OLT-005',
        'device_type': 'OLT',
        'vendor': 'ZTE',
        'model': 'ZXA10 C600',
        'hardware_version': 'V2.1',
        'firmware_version': 'ZXA10-V1.2.1',
        'rack_unit_start': 24,
        'rack_unit_height': 11,
        'status': 'ACTIVE',
        'management_ip': '10.240.20.32',
        'total_ports': 256,
        'cost_usd': 34000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380206',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
        'hostname': 'ID-BDG-GPON-OLT-01',
        'serial_number': 'NK-OLT-6601',
        'asset_tag': 'AST-OLT-006',
        'device_type': 'OLT',
        'vendor': 'Nokia',
        'model': '7360 ISAM FX-16',
        'hardware_version': 'Rev D',
        'firmware_version': 'R6.2.04',
        'rack_unit_start': 20,
        'rack_unit_height': 14,
        'status': 'ACTIVE',
        'management_ip': '10.240.30.31',
        'total_ports': 256,
        'cost_usd': 38000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380207',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
        'hostname': 'ID-BDG-GPON-OLT-02',
        'serial_number': 'NK-OLT-6602',
        'asset_tag': 'AST-OLT-007',
        'device_type': 'OLT',
        'vendor': 'Nokia',
        'model': '7360 ISAM FX-8',
        'hardware_version': 'Rev C',
        'firmware_version': 'R6.2.04',
        'rack_unit_start': 10,
        'rack_unit_height': 8,
        'status': 'ACTIVE',
        'management_ip': '10.240.30.32',
        'total_ports': 128,
        'cost_usd': 24000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380208',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        'hostname': 'ID-MDN-GPON-OLT-01',
        'serial_number': 'FH-OLT-5501',
        'asset_tag': 'AST-OLT-008',
        'device_type': 'OLT',
        'vendor': 'FiberHome',
        'model': 'AN5516-01',
        'hardware_version': 'V1.0',
        'firmware_version': 'RP1000',
        'rack_unit_start': 22,
        'rack_unit_height': 12,
        'status': 'ACTIVE',
        'management_ip': '10.240.40.31',
        'total_ports': 256,
        'cost_usd': 31000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380209',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        'hostname': 'ID-MDN-XGSPON-OLT-02',
        'serial_number': 'ZT-OLT-7703',
        'asset_tag': 'AST-OLT-009',
        'device_type': 'OLT',
        'vendor': 'ZTE',
        'model': 'ZXA10 C300',
        'hardware_version': 'V2.0',
        'firmware_version': 'ZXA10-V2.1.0',
        'rack_unit_start': 8,
        'rack_unit_height': 10,
        'status': 'ACTIVE',
        'management_ip': '10.240.40.32',
        'total_ports': 128,
        'cost_usd': 26000.00
    },
    {
        'id': 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380210',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33',
        'hostname': 'ID-SMG-GPON-OLT-01',
        'serial_number': 'HW-OLT-8804',
        'asset_tag': 'AST-OLT-010',
        'device_type': 'OLT',
        'vendor': 'Huawei',
        'model': 'SmartAX MA5800-X7',
        'hardware_version': 'H901MPSC',
        'firmware_version': 'MA5800V100R021C00',
        'rack_unit_start': 15,
        'rack_unit_height': 6,
        'status': 'ACTIVE',
        'management_ip': '10.240.50.31',
        'total_ports': 128,
        'cost_usd': 28000.00
    },

    # ---------------- 10 METRO ----------------
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380301',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-METRO-AGG-01',
        'serial_number': 'CS-MTR-9001',
        'asset_tag': 'AST-MTR-001',
        'device_type': 'METRO',
        'vendor': 'Cisco',
        'model': 'NCS 540',
        'hardware_version': 'V01',
        'firmware_version': 'IOS-XR 7.8.2',
        'rack_unit_start': 30,
        'rack_unit_height': 2,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.51',
        'total_ports': 48,
        'cost_usd': 18500.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380302',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-METRO-AGG-02',
        'serial_number': 'CS-MTR-9002',
        'asset_tag': 'AST-MTR-002',
        'device_type': 'METRO',
        'vendor': 'Cisco',
        'model': 'ASR 920',
        'hardware_version': 'V02',
        'firmware_version': 'IOS-XE 17.6.3',
        'rack_unit_start': 28,
        'rack_unit_height': 1,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.52',
        'total_ports': 24,
        'cost_usd': 12000.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380303',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'hostname': 'ID-CGK-METRO-ACC-01',
        'serial_number': 'HW-MTR-8001',
        'asset_tag': 'AST-MTR-003',
        'device_type': 'METRO',
        'vendor': 'Huawei',
        'model': 'CX600-X8',
        'hardware_version': 'V3.0',
        'firmware_version': 'V800R012C10',
        'rack_unit_start': 24,
        'rack_unit_height': 6,
        'status': 'ACTIVE',
        'management_ip': '10.240.10.53',
        'total_ports': 64,
        'cost_usd': 22000.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380304',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        'hostname': 'ID-SUB-METRO-AGG-01',
        'serial_number': 'JN-MTR-7001',
        'asset_tag': 'AST-MTR-004',
        'device_type': 'METRO',
        'vendor': 'Juniper',
        'model': 'ACX5448',
        'hardware_version': 'Rev 02',
        'firmware_version': 'Junos 22.3R1',
        'rack_unit_start': 20,
        'rack_unit_height': 1,
        'status': 'ACTIVE',
        'management_ip': '10.240.20.51',
        'total_ports': 48,
        'cost_usd': 19000.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380305',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        'hostname': 'ID-SUB-METRO-ACC-02',
        'serial_number': 'HW-MTR-8002',
        'asset_tag': 'AST-MTR-005',
        'device_type': 'METRO',
        'vendor': 'Huawei',
        'model': 'ATN 980B',
        'hardware_version': 'V2.0',
        'firmware_version': 'V800R012C10',
        'rack_unit_start': 8,
        'rack_unit_height': 4,
        'status': 'ACTIVE',
        'management_ip': '10.240.20.52',
        'total_ports': 32,
        'cost_usd': 15500.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380306',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
        'hostname': 'ID-BDG-METRO-AGG-01',
        'serial_number': 'CN-MTR-6001',
        'asset_tag': 'AST-MTR-006',
        'device_type': 'METRO',
        'vendor': 'Ciena',
        'model': '3928 Service Delivery Switch',
        'hardware_version': 'V1.2',
        'firmware_version': 'SAOS 8.6.5',
        'rack_unit_start': 6,
        'rack_unit_height': 1,
        'status': 'ACTIVE',
        'management_ip': '10.240.30.51',
        'total_ports': 24,
        'cost_usd': 11500.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380307',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
        'hostname': 'ID-BDG-METRO-ACC-02',
        'serial_number': 'JN-MTR-7002',
        'asset_tag': 'AST-MTR-007',
        'device_type': 'METRO',
        'vendor': 'Juniper',
        'model': 'ACX710 Universal Metro',
        'hardware_version': 'Rev 01',
        'firmware_version': 'Junos 22.4R1',
        'rack_unit_start': 4,
        'rack_unit_height': 1,
        'status': 'ACTIVE',
        'management_ip': '10.240.30.52',
        'total_ports': 24,
        'cost_usd': 13000.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380308',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        'hostname': 'ID-MDN-METRO-AGG-01',
        'serial_number': 'NK-MTR-5001',
        'asset_tag': 'AST-MTR-008',
        'device_type': 'METRO',
        'vendor': 'Nokia',
        'model': '7250 IXR-e',
        'hardware_version': 'H01',
        'firmware_version': 'SR OS 23.5',
        'rack_unit_start': 4,
        'rack_unit_height': 2,
        'status': 'ACTIVE',
        'management_ip': '10.240.40.51',
        'total_ports': 32,
        'cost_usd': 16000.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380309',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        'hostname': 'ID-MDN-METRO-ACC-02',
        'serial_number': 'ZT-MTR-4001',
        'asset_tag': 'AST-MTR-009',
        'device_type': 'METRO',
        'vendor': 'ZTE',
        'model': 'ZXCTN 6180H',
        'hardware_version': 'V2.0',
        'firmware_version': 'ZXCTN-V3.20',
        'rack_unit_start': 1,
        'rack_unit_height': 3,
        'status': 'ACTIVE',
        'management_ip': '10.240.40.52',
        'total_ports': 24,
        'cost_usd': 12500.00
    },
    {
        'id': 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380310',
        'rack_id': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
        'location_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d33',
        'hostname': 'ID-SMG-METRO-AGG-01',
        'serial_number': 'EC-MTR-3001',
        'asset_tag': 'AST-MTR-010',
        'device_type': 'METRO',
        'vendor': 'Edgecore',
        'model': 'AS5916-54XKS',
        'hardware_version': 'V01',
        'firmware_version': 'SONiC 2023.11',
        'rack_unit_start': 6,
        'rack_unit_height': 1,
        'status': 'ACTIVE',
        'management_ip': '10.240.50.51',
        'total_ports': 54,
        'cost_usd': 14000.00
    }
]

inserted_count = 0
for d in devices:
    con.run("""
        INSERT INTO inventory.inv_network_devices (
            id, rack_id, location_id, hostname, serial_number, asset_tag, 
            device_type, vendor, model, hardware_version, firmware_version, 
            rack_unit_start, rack_unit_height, status, management_ip, total_ports, 
            cost_usd, created_by, updated_by
        ) VALUES (
            :id, :rack_id, :location_id, :hostname, :serial_number, :asset_tag, 
            CAST(:device_type AS inventory.device_type), :vendor, :model, :hardware_version, :firmware_version, 
            :rack_unit_start, :rack_unit_height, CAST(:status AS inventory.operational_status), :management_ip, :total_ports, 
            :cost_usd, 'system', 'system'
        ) ON CONFLICT (hostname) DO UPDATE SET
            rack_id = EXCLUDED.rack_id,
            location_id = EXCLUDED.location_id,
            device_type = EXCLUDED.device_type,
            vendor = EXCLUDED.vendor,
            model = EXCLUDED.model,
            hardware_version = EXCLUDED.hardware_version,
            firmware_version = EXCLUDED.firmware_version,
            rack_unit_start = EXCLUDED.rack_unit_start,
            rack_unit_height = EXCLUDED.rack_unit_height,
            status = EXCLUDED.status,
            management_ip = EXCLUDED.management_ip,
            total_ports = EXCLUDED.total_ports,
            cost_usd = EXCLUDED.cost_usd,
            updated_at = CURRENT_TIMESTAMP;
    """, **d)
    inserted_count += 1

print(f"Successfully inserted/updated {inserted_count} devices.")

# 5. Insert Sample Ports for each device
port_count = 0
for d in devices:
    dev_id = d['id']
    d_type = d['device_type']
    
    ports_to_create = []
    if d_type == 'ROUTER':
        ports_to_create = [
            ('HundredGigE0/0/0/0', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('HundredGigE0/0/0/1', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('TenGigE0/0/1/0', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('TenGigE0/0/1/1', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('GigabitEthernet0', 1000, 'COPPER_RJ45', 'RJ45', True, False),
        ]
    elif d_type == 'OLT':
        ports_to_create = [
            ('GPON0/1/0', 2500, 'FIBER_SINGLE_MODE', 'SC/APC', True, False),
            ('GPON0/1/1', 2500, 'FIBER_SINGLE_MODE', 'SC/APC', True, False),
            ('GPON0/1/2', 2500, 'FIBER_SINGLE_MODE', 'SC/APC', True, False),
            ('GPON0/1/3', 2500, 'FIBER_SINGLE_MODE', 'SC/APC', True, False),
            ('10GE-Uplink0/19/0', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('100GE-Uplink0/20/0', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
        ]
    elif d_type == 'METRO':
        ports_to_create = [
            ('TenGigE0/0/0', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('TenGigE0/0/1', 10000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('HundredGigE0/0/24', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('HundredGigE0/0/25', 100000, 'FIBER_SINGLE_MODE', 'LC/UPC', True, False),
            ('GigabitEthernet0/1/0', 1000, 'COPPER_RJ45', 'RJ45', True, False),
        ]

    for p in ports_to_create:
        port_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{dev_id}-{p[0]}"))
        con.run("""
            INSERT INTO inventory.inv_device_ports (
                id, device_id, port_name, port_speed_mbps, medium_type, connector_type, is_operational, is_allocated
            ) VALUES (
                :id, :device_id, :port_name, :speed, CAST(:medium AS inventory.port_medium), :connector, :op, :alloc
            ) ON CONFLICT (device_id, port_name) DO UPDATE SET
                port_speed_mbps = EXCLUDED.port_speed_mbps,
                medium_type = EXCLUDED.medium_type,
                connector_type = EXCLUDED.connector_type,
                is_operational = EXCLUDED.is_operational,
                is_allocated = EXCLUDED.is_allocated;
        """, id=port_id, device_id=dev_id, port_name=p[0], speed=p[1], medium=p[2], connector=p[3], op=p[4], alloc=p[5])
        port_count += 1

print(f"Successfully inserted/updated {port_count} ports.")

# 6. Summary verification
stats = con.run("""
    SELECT device_type, count(*) 
    FROM inventory.inv_network_devices 
    GROUP BY device_type 
    ORDER BY device_type;
""")
print("\n--- Current Devices Breakdown by Type ---")
for s in stats:
    print(f"  {s[0]}: {s[1]}")

tot = con.run("SELECT count(*) FROM inventory.inv_network_devices;")[0][0]
print(f"\nTotal Devices in database: {tot}")
con.close()
