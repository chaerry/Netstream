-- ============================================================================
-- NETSTREAM TELECOM INVENTORY SYSTEM - VC4 S2C MODEL
-- MODULE 4: IP MANAGEMENT MODULE (IPAM)
-- MODULE 5: TELEPHONE NUMBER MODULE (TNM)
-- Schema: inventory
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS inventory;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 4. IP MANAGEMENT MODULE SCHEMA (RFC 4632 / RFC 791 / RFC 8200)
-- ----------------------------------------------------------------------------

-- 4.1 VRF Domains
CREATE TABLE IF NOT EXISTS inventory.inv_vrf_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(64) NOT NULL UNIQUE,
    route_distinguisher VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    route_target_export VARCHAR(64),
    route_target_import VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4.2 IP Subnet / Ranges
CREATE TABLE IF NOT EXISTS inventory.inv_ip_subnets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_subnet_id UUID REFERENCES inventory.inv_ip_subnets(id) ON DELETE SET NULL,
    vrf_id UUID REFERENCES inventory.inv_vrf_domains(id) ON DELETE RESTRICT,
    cidr VARCHAR(64) NOT NULL,
    ip_version VARCHAR(8) NOT NULL DEFAULT 'IPv4',
    name VARCHAR(128) NOT NULL,
    description TEXT,
    network_address VARCHAR(64) NOT NULL,
    broadcast_address VARCHAR(64),
    subnet_mask VARCHAR(64) NOT NULL,
    gateway_ip VARCHAR(64),
    vlan_id INT CHECK (vlan_id >= 1 AND vlan_id <= 4094),
    total_ips BIGINT NOT NULL DEFAULT 0,
    usable_ips BIGINT NOT NULL DEFAULT 0,
    allocated_count INT DEFAULT 0,
    reserved_count INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    location_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_vrf_cidr UNIQUE (vrf_id, cidr)
);

CREATE INDEX IF NOT EXISTS idx_subnets_vrf ON inventory.inv_ip_subnets(vrf_id);
CREATE INDEX IF NOT EXISTS idx_subnets_cidr ON inventory.inv_ip_subnets(cidr);

-- 4.3 Individual IP Addresses
CREATE TABLE IF NOT EXISTS inventory.inv_ip_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subnet_id UUID NOT NULL REFERENCES inventory.inv_ip_subnets(id) ON DELETE CASCADE,
    ip_address VARCHAR(64) NOT NULL,
    ip_version VARCHAR(8) NOT NULL DEFAULT 'IPv4',
    status VARCHAR(32) NOT NULL DEFAULT 'ALLOCATED',
    hostname VARCHAR(128),
    device_id UUID REFERENCES inventory.inv_network_devices(id) ON DELETE SET NULL,
    port_id UUID REFERENCES inventory.inv_device_ports(id) ON DELETE SET NULL,
    interface_name VARCHAR(64),
    mac_address VARCHAR(32),
    dns_ptr VARCHAR(255),
    customer_name VARCHAR(255),
    service_id UUID REFERENCES inventory.inv_services(id) ON DELETE SET NULL,
    service_code VARCHAR(64),
    notes TEXT,
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assigned_by VARCHAR(128) DEFAULT 'system',
    CONSTRAINT uq_subnet_ip UNIQUE (subnet_id, ip_address)
);

CREATE INDEX IF NOT EXISTS idx_ip_addr ON inventory.inv_ip_addresses(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_device ON inventory.inv_ip_addresses(device_id);

-- ----------------------------------------------------------------------------
-- 5. TELEPHONE NUMBER MODULE SCHEMA (ITU-T E.164)
-- ----------------------------------------------------------------------------

-- 5.1 Telephone Number Blocks & Ranges
CREATE TABLE IF NOT EXISTS inventory.inv_telephone_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prefix VARCHAR(32) NOT NULL,
    block_pattern VARCHAR(64) NOT NULL,
    country_code VARCHAR(8) NOT NULL DEFAULT '+62',
    area_code VARCHAR(8),
    region_name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'GEOGRAPHIC',
    range_start VARCHAR(32) NOT NULL,
    range_end VARCHAR(32) NOT NULL,
    total_capacity INT NOT NULL DEFAULT 10000,
    allocated_count INT DEFAULT 0,
    reserved_count INT DEFAULT 0,
    quarantine_count INT DEFAULT 0,
    ported_count INT DEFAULT 0,
    regulatory_ref VARCHAR(128),
    operator_or_node VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_block_prefix UNIQUE (prefix, country_code)
);

CREATE INDEX IF NOT EXISTS idx_blocks_prefix ON inventory.inv_telephone_blocks(prefix);
CREATE INDEX IF NOT EXISTS idx_blocks_category ON inventory.inv_telephone_blocks(category);

-- 5.2 Individual Telephone Numbers
CREATE TABLE IF NOT EXISTS inventory.inv_telephone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_id UUID NOT NULL REFERENCES inventory.inv_telephone_blocks(id) ON DELETE CASCADE,
    e164_format VARCHAR(32) NOT NULL UNIQUE,
    national_format VARCHAR(32) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'GEOGRAPHIC',
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    customer_name VARCHAR(255),
    customer_account VARCHAR(64),
    service_id UUID REFERENCES inventory.inv_services(id) ON DELETE SET NULL,
    service_code VARCHAR(64),
    assigned_node VARCHAR(128),
    location_name VARCHAR(255),
    activation_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_phone_e164 ON inventory.inv_telephone_numbers(e164_format);
CREATE INDEX IF NOT EXISTS idx_phone_status ON inventory.inv_telephone_numbers(status);

-- 5.3 Number Portability (MNP / FNP)
CREATE TABLE IF NOT EXISTS inventory.inv_number_porting (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    porting_reference VARCHAR(64) NOT NULL UNIQUE,
    telephone_number VARCHAR(32) NOT NULL,
    direction VARCHAR(16) NOT NULL, -- 'PORTED_IN', 'PORTED_OUT'
    donor_operator VARCHAR(128) NOT NULL,
    recipient_operator VARCHAR(128) NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    porting_due_date DATE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
    regulatory_clearance_code VARCHAR(64),
    rejection_reason TEXT,
    requester_name VARCHAR(128) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_porting_num ON inventory.inv_number_porting(telephone_number);
CREATE INDEX IF NOT EXISTS idx_porting_ref ON inventory.inv_number_porting(porting_reference);
