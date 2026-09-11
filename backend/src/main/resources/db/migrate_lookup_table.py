import pg8000.native

con = pg8000.native.Connection(
    user='n8n',
    password='rahasia',
    host='145.79.8.141',
    port=5433,
    database='netstream'
)

print("Step 1: Create inventory.inv_device_types table")
con.run("""
CREATE TABLE IF NOT EXISTS inventory.inv_device_types (
    code VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
""")

print("Step 2: Populate device types")
types = [
    ('ROUTER', 'Core / Edge Router', 'L3_ROUTING', 'Layer 3 Core and Provider Edge backbone routing chassis', True, 1),
    ('SWITCH', 'Data Center Switch', 'L2_L3_SWITCHING', 'Data Center leaf-spine and core aggregation switches', True, 2),
    ('DWDM_CHASSIS', 'DWDM Optical Transport', 'OPTICAL', 'Dense Wavelength Division Multiplexing optical transport chassis', True, 3),
    ('OLT', 'GPON / XGS-PON OLT', 'ACCESS_PON', 'Optical Line Terminal for FTTH/FTTB gigabit access networks', True, 4),
    ('METRO', 'Metro Ethernet / Aggregation Switch', 'METRO_ACCESS', 'Carrier Ethernet metro aggregation and access demarcation node', True, 5),
    ('FIREWALL', 'NextGen Firewall', 'SECURITY', 'Next-Generation Firewall and enterprise security gateway', True, 6),
    ('SERVER', 'Hypervisor Server', 'COMPUTE', 'Compute hypervisor host running virtual network appliances (VNFs)', True, 7),
    ('DSLAM', 'DSLAM Access Node', 'ACCESS_COPPER', 'Digital Subscriber Line Access Multiplexer broadband access', True, 8),
    ('ODF', 'Optical Distribution Frame (ODF)', 'PASSIVE_OPTICAL', 'High-density fiber optic cable termination and distribution frame', True, 9),
    ('DDF', 'Digital Distribution Frame (DDF)', 'PASSIVE_COPPER', 'Digital distribution frame for TDM/E1/DS3 cross-connects', True, 10),
    ('PATCH_PANEL', 'Fiber / Copper Patch Panel', 'PASSIVE', 'Standard rack-mount patch panel interconnect', True, 11)
]

for t in types:
    con.run("""
        INSERT INTO inventory.inv_device_types (code, name, category, description, is_active, display_order)
        VALUES (:code, :name, :cat, :desc, :active, :order)
        ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            is_active = EXCLUDED.is_active,
            display_order = EXCLUDED.display_order;
    """, code=t[0], name=t[1], cat=t[2], desc=t[3], active=t[4], order=t[5])

print("Step 3: Alter column type to VARCHAR(32)")
con.run("ALTER TABLE inventory.inv_network_devices ALTER COLUMN device_type TYPE VARCHAR(32) USING device_type::text;")

print("Step 4: Add foreign key constraint if not present")
fk_exists = con.run("""
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'inventory' 
      AND table_name = 'inv_network_devices' 
      AND constraint_name = 'fk_devices_device_type';
""")

if not fk_exists:
    con.run("""
        ALTER TABLE inventory.inv_network_devices
            ADD CONSTRAINT fk_devices_device_type FOREIGN KEY (device_type)
            REFERENCES inventory.inv_device_types(code) ON UPDATE CASCADE;
    """)
    print("Added foreign key constraint fk_devices_device_type.")
else:
    print("Foreign key constraint fk_devices_device_type already exists.")

print("\n--- Result: inv_device_types content ---")
for r in con.run("SELECT code, name, category, is_active, display_order FROM inventory.inv_device_types ORDER BY display_order;"):
    print(f"  {r[0]:<15} | {r[1]:<35} | {r[2]:<16} | active={r[3]}")

print("\n--- Sample inv_network_devices records with device_type ---")
for r in con.run("SELECT hostname, device_type, vendor, model FROM inventory.inv_network_devices LIMIT 5;"):
    print(f"  {r[0]:<22} | {r[1]:<10} | {r[2]:<10} | {r[3]}")

con.close()
