-- ============================================================================
-- NETSTREAM TELECOM INVENTORY MODULE (VC4 S2C Model)
-- Database: PostgreSQL 15+ | Schema: inventory
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS inventory;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE inventory.location_type AS ENUM (
        'COUNTRY', 'REGION', 'CITY', 'SITE', 'BUILDING', 'FLOOR', 'ROOM'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory.device_type AS ENUM (
        'ROUTER', 'SWITCH', 'DWDM_CHASSIS', 'OLT', 'DSLAM', 
        'FIREWALL', 'SERVER', 'ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'ONT', 'DDF', 'PATCH_PANEL', 'METRO'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory.operational_status AS ENUM (
        'PLANNED', 'INSTALLED', 'ACTIVE', 'MAINTENANCE', 'FAULTY', 'DECOMMISSIONED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory.port_medium AS ENUM (
        'COPPER_RJ45', 'FIBER_SINGLE_MODE', 'FIBER_MULTI_MODE', 'WIRELESS'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory.service_type AS ENUM (
        'L2_VPN_MPLS', 'L3_VPN_MPLS', 'INTERNET_DIRECT', 
        'DARK_FIBER', 'WAVELENGTH_SERVICE', 'METRO_ETHERNET',
        'GPON_BROADBAND', 'FTTH_ACCESS'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory.service_status AS ENUM (
        'PLANNED', 'PROVISIONING', 'ACTIVE', 'SUSPENDED', 'TERMINATED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 1. LOCATION HIERARCHY (1.7 Network Location Management)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES inventory.inv_locations(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type inventory.location_type NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    contact_person VARCHAR(128),
    contact_phone VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(128) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(128) NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON inventory.inv_locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON inventory.inv_locations(type);

-- ----------------------------------------------------------------------------
-- 2. RACK INFRASTRUCTURE (1.1 Physical Inventory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_racks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES inventory.inv_locations(id) ON DELETE RESTRICT,
    rack_number VARCHAR(64) NOT NULL,
    height_units INT NOT NULL DEFAULT 42,
    max_power_watt DECIMAL(10, 2) DEFAULT 5000.00,
    current_power_watt DECIMAL(10, 2) DEFAULT 0.00,
    max_weight_kg DECIMAL(10, 2) DEFAULT 800.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(128) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(128) NOT NULL DEFAULT 'system',
    CONSTRAINT uq_location_rack UNIQUE (location_id, rack_number)
);

CREATE INDEX IF NOT EXISTS idx_racks_location_id ON inventory.inv_racks(location_id);

-- ----------------------------------------------------------------------------
-- 2.1 DEVICE TYPES CATALOG (Lookup Table Pattern)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_device_types (
    code VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. PHYSICAL NETWORK DEVICES (1.1 Physical Inventory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_network_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rack_id UUID REFERENCES inventory.inv_racks(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES inventory.inv_locations(id) ON DELETE RESTRICT,
    hostname VARCHAR(128) NOT NULL UNIQUE,
    serial_number VARCHAR(128) NOT NULL UNIQUE,
    asset_tag VARCHAR(128) UNIQUE,
    device_type VARCHAR(32) NOT NULL REFERENCES inventory.inv_device_types(code) ON UPDATE CASCADE,
    vendor VARCHAR(64) NOT NULL,
    model VARCHAR(128) NOT NULL,
    hardware_version VARCHAR(64),
    firmware_version VARCHAR(64),
    rack_unit_start INT,
    rack_unit_height INT DEFAULT 1,
    status inventory.operational_status NOT NULL DEFAULT 'PLANNED',
    management_ip VARCHAR(64),
    total_ports INT DEFAULT 0,
    cost_usd DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(128) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(128) NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_devices_location_id ON inventory.inv_network_devices(location_id);
CREATE INDEX IF NOT EXISTS idx_devices_rack_id ON inventory.inv_network_devices(rack_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON inventory.inv_network_devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_type ON inventory.inv_network_devices(device_type);

-- ----------------------------------------------------------------------------
-- 4. DEVICE PORTS & INTERFACES (1.1 & 1.2 Physical & Logical Ports)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_device_ports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES inventory.inv_network_devices(id) ON DELETE CASCADE,
    port_name VARCHAR(64) NOT NULL,
    port_speed_mbps INT NOT NULL DEFAULT 1000,
    medium_type inventory.port_medium NOT NULL DEFAULT 'COPPER_RJ45',
    connector_type VARCHAR(32) DEFAULT 'LC/UPC',
    mac_address VARCHAR(32),
    is_operational BOOLEAN NOT NULL DEFAULT FALSE,
    is_allocated BOOLEAN NOT NULL DEFAULT FALSE,
    connected_port_id UUID REFERENCES inventory.inv_device_ports(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_device_port_name UNIQUE (device_id, port_name)
);

CREATE INDEX IF NOT EXISTS idx_ports_device_id ON inventory.inv_device_ports(device_id);
CREATE INDEX IF NOT EXISTS idx_ports_connected_port ON inventory.inv_device_ports(connected_port_id);

-- ----------------------------------------------------------------------------
-- 5. LOGICAL & VIRTUAL NETWORK ELEMENTS (1.2 Logical & Virtual Inventory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_virtual_network_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hypervisor_device_id UUID REFERENCES inventory.inv_network_devices(id) ON DELETE SET NULL,
    vne_name VARCHAR(128) NOT NULL UNIQUE,
    vnf_type VARCHAR(64) NOT NULL,
    vlan_id INT CHECK (vlan_id >= 1 AND vlan_id <= 4094),
    vrf_name VARCHAR(64),
    allocated_vcpu INT NOT NULL DEFAULT 2,
    allocated_ram_gb INT NOT NULL DEFAULT 4,
    allocated_disk_gb INT NOT NULL DEFAULT 50,
    status inventory.operational_status NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(128) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(128) NOT NULL DEFAULT 'system'
);

-- ----------------------------------------------------------------------------
-- 6. SERVICE INVENTORY (1.3 Service Inventory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_code VARCHAR(64) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    service_type inventory.service_type NOT NULL,
    bandwidth_mbps INT NOT NULL,
    sla_tier VARCHAR(32) NOT NULL DEFAULT 'STANDARD',
    sla_availability_pct DECIMAL(5, 2) DEFAULT 99.90,
    monthly_recurring_cost DECIMAL(12, 2) DEFAULT 0.00,
    status inventory.service_status NOT NULL DEFAULT 'PLANNED',
    a_end_location_id UUID NOT NULL REFERENCES inventory.inv_locations(id),
    z_end_location_id UUID NOT NULL REFERENCES inventory.inv_locations(id),
    activation_date TIMESTAMP WITH TIME ZONE,
    termination_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(128) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(128) NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_services_status ON inventory.inv_services(status);
CREATE INDEX IF NOT EXISTS idx_services_code ON inventory.inv_services(service_code);

-- ----------------------------------------------------------------------------
-- 7. SERVICE RESOURCE MAPPINGS (1.3 Service-to-Resource Mapping)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory.inv_service_resource_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES inventory.inv_services(id) ON DELETE CASCADE,
    device_id UUID REFERENCES inventory.inv_network_devices(id) ON DELETE RESTRICT,
    port_id UUID REFERENCES inventory.inv_device_ports(id) ON DELETE RESTRICT,
    vne_id UUID REFERENCES inventory.inv_virtual_network_elements(id) ON DELETE RESTRICT,
    resource_role VARCHAR(64) NOT NULL,
    hop_order INT NOT NULL DEFAULT 1,
    allocated_bandwidth_mbps INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_resource_type CHECK (device_id IS NOT NULL OR vne_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_srm_service_id ON inventory.inv_service_resource_mappings(service_id);
