-- ==============================================================================
-- NETSTREAM TELECOM INVENTORY PLATFORM (VC4 S2C MODEL)
-- MODULE 6: INTEGRATION & AUTOMATION ENGINE SCHEMA
-- Dedicated Schema: integration (Option A - Modular Schema Separation)
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS integration;

-- ------------------------------------------------------------------------------
-- 1. CONNECTORS: Multi-Vendor EMS / NMS & Direct NE Adapters
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration.connectors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    vendor VARCHAR(50) NOT NULL,            -- HUAWEI, CISCO, NOKIA, ZTE, FIBERHOME, GENERIC_SNMP
    connector_type VARCHAR(50) NOT NULL,    -- EMS_NMS, DIRECT_NE, TELEMETRY_INGEST
    protocol VARCHAR(30) NOT NULL,          -- REST_API, NETCONF_YANG, RESTCONF, SNMP_V2C, SNMP_V3, CLI_SSH, TL1
    endpoint_url VARCHAR(255) NOT NULL,
    auth_type VARCHAR(30) DEFAULT 'TOKEN',  -- TOKEN, BASIC, SSH_KEY, SNMP_COMMUNITY, SNMP_USM
    auth_credential_masked VARCHAR(255),    -- Masked storage of API key / Community
    status VARCHAR(30) NOT NULL DEFAULT 'ONLINE', -- ONLINE, DEGRADED, OFFLINE, TESTING
    ping_latency_ms INTEGER DEFAULT 12,
    sync_interval_mins INTEGER DEFAULT 60,
    auto_reconcile_enabled BOOLEAN DEFAULT TRUE,
    auto_approve_minor_diffs BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(50) DEFAULT 'SUCCESS',
    managed_elements_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_integration_conn_vendor ON integration.connectors(vendor);
CREATE INDEX IF NOT EXISTS idx_integration_conn_status ON integration.connectors(status);

-- ------------------------------------------------------------------------------
-- 2. DISCOVERY JOBS: Audit History of Auto-Discovery Sweeps
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration.discovery_jobs (
    id BIGSERIAL PRIMARY KEY,
    connector_id BIGINT NOT NULL REFERENCES integration.connectors(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,          -- FULL_INVENTORY_SWEEP, TOPOLOGY_LLDP, TRANSCEIVER_OPTICAL, INTERFACE_POLL
    status VARCHAR(30) NOT NULL DEFAULT 'RUNNING', -- PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    elements_scanned INTEGER DEFAULT 0,
    discrepancies_found INTEGER DEFAULT 0,
    error_message TEXT,
    initiated_by VARCHAR(100) DEFAULT 'SYSTEM_SCHEDULER'
);

CREATE INDEX IF NOT EXISTS idx_integration_job_conn ON integration.discovery_jobs(connector_id);
CREATE INDEX IF NOT EXISTS idx_integration_job_status ON integration.discovery_jobs(status);

-- ------------------------------------------------------------------------------
-- 3. RECONCILIATION ITEMS: Discovered Live State vs Netstream SSoT Diff
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration.reconciliation_items (
    id BIGSERIAL PRIMARY KEY,
    discovery_job_id BIGINT REFERENCES integration.discovery_jobs(id) ON DELETE SET NULL,
    connector_id BIGINT NOT NULL REFERENCES integration.connectors(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,       -- DEVICE, PORT, TRANSCEIVER, OPTICAL_STRAND, VLAN, VRF, CIRCUIT
    entity_identifier VARCHAR(150) NOT NULL,-- e.g., Hostname, IP, or Port Name (e.g. JKT-CORE-01/GigabitEthernet0/0/1)
    target_inventory_id BIGINT,             -- Optional reference to inventory.devices or inventory.ports
    discrepancy_type VARCHAR(50) NOT NULL,  -- NEW_DISCOVERED, MISSING_IN_LIVE, ATTRIBUTE_MISMATCH, STATE_DRIFT
    attribute_name VARCHAR(100),            -- e.g., 'portSpeed', 'serialNumber', 'adminStatus', 'transceiverWavelength'
    inventory_value TEXT,                   -- State currently recorded in SSoT (or JSON)
    live_discovered_value TEXT,             -- State pulled live from network (or JSON)
    severity VARCHAR(20) NOT NULL DEFAULT 'MINOR', -- CRITICAL, MAJOR, MINOR, INFO
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, AUTO_RESOLVED, MANUALLY_SYNCED, REJECTED_ROGUE, ESCALATED_BPMN
    resolution_action VARCHAR(50),          -- APPLY_TO_INVENTORY, IGNORE_MARK_ROGUE, DISPATCH_WORK_ORDER
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    gaharu_process_instance_id VARCHAR(100),-- Link to Gaharu_BPMN_NGIN for field inspection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_integration_rec_status ON integration.reconciliation_items(status);
CREATE INDEX IF NOT EXISTS idx_integration_rec_type ON integration.reconciliation_items(discrepancy_type);
CREATE INDEX IF NOT EXISTS idx_integration_rec_entity ON integration.reconciliation_items(entity_type, entity_identifier);

-- ------------------------------------------------------------------------------
-- 4. CHANGE LOGS: Universal Change Data Capture (CDC) Audit Ledger
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration.change_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100) NOT NULL DEFAULT 'system',
    user_role VARCHAR(50) DEFAULT 'TELECOM_ENGINEER',
    client_ip VARCHAR(50),
    entity_domain VARCHAR(50) NOT NULL,     -- PHYSICAL, LOGICAL, OPTICAL_CABLE, LEASED_LINE, IPAM, TELEPHONY, INTEGRATION
    entity_type VARCHAR(50) NOT NULL,       -- DeviceEntity, PortEntity, LeasedLineCircuitEntity, etc.
    entity_id VARCHAR(100) NOT NULL,        -- Primary key or code of entity
    action VARCHAR(30) NOT NULL,            -- CREATE, UPDATE, DELETE, STATE_CHANGE, RECONCILIATION_SYNC
    summary TEXT NOT NULL,
    before_snapshot_json JSONB,             -- State prior to change
    after_snapshot_json JSONB,              -- State after change
    diff_summary_json JSONB                 -- Computed altered fields
);

CREATE INDEX IF NOT EXISTS idx_integration_changelog_domain ON integration.change_logs(entity_domain);
CREATE INDEX IF NOT EXISTS idx_integration_changelog_entity ON integration.change_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_integration_changelog_time ON integration.change_logs(timestamp DESC);

-- ------------------------------------------------------------------------------
-- 5. ALARMS: Real-Time Ingested Alarms with Telecom Inventory Enrichment
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration.alarms (
    id BIGSERIAL PRIMARY KEY,
    alarm_identifier VARCHAR(100) NOT NULL UNIQUE, -- e.g. ALM-20260914-001
    source_system VARCHAR(50) NOT NULL,     -- HUAWEI_NCE, CISCO_EPNM, SNMP_TRAP, SYSLOG, REST_INGEST
    source_ip VARCHAR(50),
    alarm_name VARCHAR(150) NOT NULL,       -- e.g. LinkDown, BGPNeighborLoss, LossOfSignal, HighBitErrorRate
    alarm_type VARCHAR(50) NOT NULL,        -- COMMUNICATIONS_ALARM, QUALITY_OF_SERVICE, PROCESSING_ERROR, EQUIPMENT_ALARM
    severity VARCHAR(20) NOT NULL,          -- CRITICAL, MAJOR, MINOR, WARNING, INDETERMINATE, CLEARED
    lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE_UNACKNOWLEDGED', -- ACTIVE_UNACKNOWLEDGED, ACKNOWLEDGED, IN_INVESTIGATION, RESOLVED, AUTO_CLEARED
    raised_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cleared_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    raw_payload_json JSONB,                 -- Original raw trap/syslog/REST payload

    -- TELECOM ENRICHED TOPOLOGY LINKAGES (The SSoT Bridge)
    device_id BIGINT,                       -- Correlated device in inventory.devices
    device_name VARCHAR(100),
    port_id BIGINT,                         -- Correlated port in inventory.ports
    port_name VARCHAR(100),
    location_name VARCHAR(100),             -- POP / Datacenter
    rack_code VARCHAR(50),                  -- 42U Rack code
    optical_cable_code VARCHAR(100),        -- Correlated optical cable
    optical_strand_no INTEGER,              -- Exact optical strand
    leased_line_circuit_code VARCHAR(100),  -- Correlated leased line (if off-net or on-net)
    carrier_name VARCHAR(100),              -- 3rd-party carrier (Telkom, Indosat, etc.)
    sla_tier VARCHAR(30),                   -- PLATINUM_99_999, GOLD_99_99
    impacted_services_count INTEGER DEFAULT 0,
    impacted_customers_count INTEGER DEFAULT 0,
    estimated_revenue_risk_usd NUMERIC(15, 2) DEFAULT 0.00,
    gaharu_ticket_id VARCHAR(100),          -- Dispatched trouble ticket ID in Gaharu_BPMN_NGIN
    root_cause_tag VARCHAR(100)             -- e.g. 'FIBER_CUT_SP04', 'POWER_SUPPLY_FAIL', 'TRANSCEIVER_DEGRADED'
);

CREATE INDEX IF NOT EXISTS idx_integration_alarm_sev ON integration.alarms(severity);
CREATE INDEX IF NOT EXISTS idx_integration_alarm_status ON integration.alarms(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_integration_alarm_device ON integration.alarms(device_id);
CREATE INDEX IF NOT EXISTS idx_integration_alarm_time ON integration.alarms(raised_at DESC);

-- ------------------------------------------------------------------------------
-- 6. WEBHOOK SUBSCRIPTIONS: Northbound BSS/OSS Event Notification Hub
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration.webhook_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subscriber_system VARCHAR(100) NOT NULL, -- CRM_SALESFORCE, SERVICENOW_ITSM, BILLING_SAP, GAHARU_BPMN
    target_url VARCHAR(255) NOT NULL,
    event_topics TEXT NOT NULL,              -- Comma-separated: 'ResourceCreated,AlarmCritical,ReconciliationDrift,CircuitStatus'
    secret_token VARCHAR(255) NOT NULL,      -- Secret for HMAC-SHA256 signature verification
    is_active BOOLEAN DEFAULT TRUE,
    retry_count INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. WEBHOOK LOGS: Delivery Audit Trail
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration.webhook_logs (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES integration.webhook_subscriptions(id) ON DELETE CASCADE,
    event_topic VARCHAR(100) NOT NULL,
    payload_json JSONB NOT NULL,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    response_code INTEGER,
    response_body TEXT,
    latency_ms INTEGER,
    status VARCHAR(20) NOT NULL              -- DELIVERED, RETRYING, FAILED
);

CREATE INDEX IF NOT EXISTS idx_integration_whlog_sub ON integration.webhook_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_integration_whlog_status ON integration.webhook_logs(status);

-- ==============================================================================
-- SEED DATA: Connectors, Discovery Jobs, Discrepancies, CDC Logs, Alarms, Webhooks
-- ==============================================================================

-- 1. Multi-Vendor Connectors
INSERT INTO integration.connectors (
    name, vendor, connector_type, protocol, endpoint_url, auth_type, auth_credential_masked,
    status, ping_latency_ms, sync_interval_mins, auto_reconcile_enabled, auto_approve_minor_diffs,
    last_sync_at, last_sync_status, managed_elements_count
) VALUES
('Huawei-NCE-IP-Backbone', 'HUAWEI', 'EMS_NMS', 'REST_API', 'https://nce-ip.netstream.corp:8443/restconf/v1', 'TOKEN', 'Bearer nce_live_tok_9918******', 'ONLINE', 14, 30, TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '15 minutes', 'SUCCESS', 248),
('Cisco-EPNM-Metro-Core', 'CISCO', 'EMS_NMS', 'RESTCONF', 'https://epnm.netstream.corp:9002/restconf/data', 'BASIC', 'admin:cisc0_sec******', 'ONLINE', 8, 30, TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '22 minutes', 'SUCCESS', 184),
('Nokia-NSP-DWDM-Optical', 'NOKIA', 'EMS_NMS', 'REST_API', 'https://nsp-optical.netstream.corp:8543/v4/optical', 'TOKEN', 'Bearer nsp_w091******', 'ONLINE', 19, 60, TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '40 minutes', 'SUCCESS', 92),
('ZTE-ZENIC-Aggregation', 'ZTE', 'EMS_NMS', 'NETCONF_YANG', 'zenic-agg.netstream.corp:830', 'SSH_KEY', 'id_rsa_zenic_prod', 'DEGRADED', 78, 60, FALSE, FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours', 'PARTIAL_TIMEOUT', 64),
('SNMPv3-Edge-Collector', 'GENERIC_SNMP', 'TELEMETRY_INGEST', 'SNMP_V3', '10.200.0.50:162', 'SNMP_USM', 'authPriv:sha256/aes128', 'ONLINE', 4, 15, TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'SUCCESS', 520)
ON CONFLICT (name) DO NOTHING;

-- 2. Discovery Jobs
INSERT INTO integration.discovery_jobs (
    connector_id, job_type, status, started_at, completed_at, elements_scanned, discrepancies_found, initiated_by
) VALUES
(1, 'FULL_INVENTORY_SWEEP', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '25 minutes', CURRENT_TIMESTAMP - INTERVAL '15 minutes', 248, 5, 'SYSTEM_SCHEDULER'),
(2, 'TOPOLOGY_LLDP', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '35 minutes', CURRENT_TIMESTAMP - INTERVAL '22 minutes', 184, 2, 'SYSTEM_SCHEDULER'),
(3, 'TRANSCEIVER_OPTICAL', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '40 minutes', 92, 3, 'planner.surabaya'),
(5, 'INTERFACE_POLL', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 520, 1, 'SYSTEM_SCHEDULER')
ON CONFLICT DO NOTHING;

-- 3. Reconciliation Discrepancies
INSERT INTO integration.reconciliation_items (
    discovery_job_id, connector_id, entity_type, entity_identifier, discrepancy_type, attribute_name,
    inventory_value, live_discovered_value, severity, status, resolution_action, resolved_by, resolved_at, resolution_notes, gaharu_process_instance_id
) VALUES
(1, 1, 'TRANSCEIVER', 'JKT-CORE-PE-01/HundredGigE0/1/0/2', 'ATTRIBUTE_MISMATCH', 'transceiverPartNumber', 'QSFP28-100G-LR4-10KM', 'QSFP28-100G-ER4-40KM', 'MINOR', 'PENDING_REVIEW', NULL, NULL, NULL, 'Field tech swapped optic to extended 40km reach during scheduled maintenance. Ready for 1-click sync.', NULL),
(1, 1, 'PORT', 'BDG-AGG-R02/GigabitEthernet0/0/14', 'STATE_DRIFT', 'operStatus', 'DOWN (ADMIN_DOWN)', 'UP (ACTIVE_TRAFFIC)', 'MAJOR', 'PENDING_REVIEW', NULL, NULL, NULL, 'Port was enabled on live equipment without inventory service order. 2.4 Gbps traffic detected.', NULL),
(1, 1, 'DEVICE', 'SBY-LEAF-SW-08 (10.200.12.88)', 'NEW_DISCOVERED', 'devicePresence', 'NOT_FOUND_IN_INVENTORY', 'Cisco Nexus 93180YC-FX (SN: FOC2238491A)', 'CRITICAL', 'PENDING_REVIEW', NULL, NULL, NULL, 'Uncataloged shadow switch discovered via LLDP neighbor from SBY-CORE-PE-02.', NULL),
(2, 2, 'VLAN', 'JKT-DC01-VLAN-882', 'ATTRIBUTE_MISMATCH', 'vlanName', 'CORPORATE-VPN-BCA', 'CORP-VPN-BCA-SECURE-DR', 'INFO', 'AUTO_RESOLVED', 'APPLY_TO_INVENTORY', 'AUTO_RULE_ENGINE', CURRENT_TIMESTAMP - INTERVAL '20 minutes', 'Minor label normalization auto-applied per policy.', NULL),
(3, 3, 'OPTICAL_STRAND', 'CBL-TRK-JKT-BDG-01/Strand-18', 'STATE_DRIFT', 'opticalRxPowerDbm', '-14.2 dBm', '-28.6 dBm (EXCESSIVE_LOSS)', 'CRITICAL', 'ESCALATED_BPMN', 'DISPATCH_WORK_ORDER', 'engineer.noc', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'Severe optical attenuation breach detected. Dispatched OTDR field inspection to Gaharu_BPMN_NGIN.', 'GAHARU-BPMN-OTDR-202609-00891')
ON CONFLICT DO NOTHING;

-- 4. Change Data Capture (CDC) Logs
INSERT INTO integration.change_logs (
    timestamp, username, user_role, client_ip, entity_domain, entity_type, entity_id, action, summary,
    before_snapshot_json, after_snapshot_json, diff_summary_json
) VALUES
(CURRENT_TIMESTAMP - INTERVAL '1 hour', 'admin.jakarta', 'TELECOM_ADMIN', '10.200.0.12', 'LEASED_LINE', 'LeasedLineCircuitEntity', 'LL-TELKOM-EPL-10G-01', 'STATE_CHANGE', 'Transitioned circuit lifecycle from TESTING to ACTIVE_IN_SERVICE',
 '{"circuitCode": "LL-TELKOM-EPL-10G-01", "status": "TESTING", "bandwidthGbps": 10.0}',
 '{"circuitCode": "LL-TELKOM-EPL-10G-01", "status": "ACTIVE_IN_SERVICE", "bandwidthGbps": 10.0}',
 '{"status": {"from": "TESTING", "to": "ACTIVE_IN_SERVICE"}}'),

(CURRENT_TIMESTAMP - INTERVAL '45 minutes', 'planner.surabaya', 'TELECOM_PLANNER', '10.200.1.8', 'PHYSICAL', 'DeviceEntity', 'DEV-SBY-PE-02', 'UPDATE', 'Updated primary loopback IP and management credentials',
 '{"name": "SBY-CORE-PE-02", "primaryIp": "10.200.2.1"}',
 '{"name": "SBY-CORE-PE-02", "primaryIp": "10.200.2.2"}',
 '{"primaryIp": {"from": "10.200.2.1", "to": "10.200.2.2"}}'),

(CURRENT_TIMESTAMP - INTERVAL '20 minutes', 'SYSTEM_AUTO_RECONCILER', 'SYSTEM', '127.0.0.1', 'INTEGRATION', 'IntegrationReconciliationItemEntity', 'REC-20260914-04', 'RECONCILIATION_SYNC', 'Auto-synchronized VLAN label from Huawei NCE live discovery',
 '{"vlanName": "CORPORATE-VPN-BCA"}',
 '{"vlanName": "CORP-VPN-BCA-SECURE-DR"}',
 '{"vlanName": {"from": "CORPORATE-VPN-BCA", "to": "CORP-VPN-BCA-SECURE-DR"}}')
ON CONFLICT DO NOTHING;

-- 5. Enriched Alarms
INSERT INTO integration.alarms (
    alarm_identifier, source_system, source_ip, alarm_name, alarm_type, severity, lifecycle_status,
    raised_at, raw_payload_json, device_id, device_name, port_id, port_name, location_name, rack_code,
    optical_cable_code, optical_strand_no, leased_line_circuit_code, carrier_name, sla_tier,
    impacted_services_count, impacted_customers_count, estimated_revenue_risk_usd, gaharu_ticket_id, root_cause_tag
) VALUES
('ALM-20260914-001', 'HUAWEI_NCE', '10.200.1.1', 'LossOfSignal (LOS)', 'COMMUNICATIONS_ALARM', 'CRITICAL', 'ACTIVE_UNACKNOWLEDGED',
 CURRENT_TIMESTAMP - INTERVAL '12 minutes', '{"event": "LOS", "interface": "100GE0/1/0/1", "shelf": 1, "slot": 1}',
 1, 'JKT-CORE-PE-01', 1, 'HundredGigE0/1/0/1', 'JKT-DATACENTER-01', 'RACK-DC-04',
 'CBL-TRK-JKT-BDG-01', 12, 'LL-TELKOM-EPL-10G-01', 'Telkom Indonesia', 'PLATINUM_99_999',
 4, 3, 24500.00, 'GAHARU-INC-202609-0014', 'FIBER_CUT_SP04'),

('ALM-20260914-002', 'CISCO_EPNM', '10.200.2.1', 'BGPPeerSessionDown', 'COMMUNICATIONS_ALARM', 'MAJOR', 'IN_INVESTIGATION',
 CURRENT_TIMESTAMP - INTERVAL '35 minutes', '{"peer": "192.168.100.5", "asn": 64512, "vrf": "CORP-INTERNET"}',
 2, 'SBY-CORE-PE-01', 3, 'TenGigE0/0/0/2', 'SBY-DATACENTER-01', 'RACK-DC-02',
 'CBL-FDR-SBY-01', 4, 'LL-INDOSAT-EVPL-1G-01', 'Indosat Ooredoo Hutchison', 'GOLD_99_99',
 1, 1, 4800.00, 'GAHARU-INC-202609-0011', 'CARRIER_TRANSIT_FLAP'),

('ALM-20260914-003', 'SNMP_TRAP', '10.200.3.1', 'PowerSupplyModuleFailure', 'EQUIPMENT_ALARM', 'WARNING', 'ACKNOWLEDGED',
 CURRENT_TIMESTAMP - INTERVAL '2 hours', '{"entity": "PEM-B", "sensor": "PowerLoss"}',
 4, 'BDG-AGG-SW-01', NULL, NULL, 'BDG-SHELTER-01', 'RACK-SH-01',
 NULL, NULL, NULL, NULL, 'BEST_EFFORT',
 0, 0, 0.00, NULL, 'CHASSIS_POWER_REDUNDANCY_LOSS')
ON CONFLICT (alarm_identifier) DO NOTHING;

-- 6. Webhook Subscriptions
INSERT INTO integration.webhook_subscriptions (
    name, subscriber_system, target_url, event_topics, secret_token, is_active, retry_count, timeout_ms
) VALUES
('ServiceNow-ITSM-Alarms', 'SERVICENOW_ITSM', 'https://servicenow.netstream.corp/api/now/table/u_network_alarms', 'AlarmCritical,AlarmMajor,CircuitDown', 'sec_sn_hmac_881903******', TRUE, 3, 5000),
('Gaharu-BPMN-Provisioning-Hook', 'GAHARU_BPMN', 'https://bpmn.netstream.corp/engine-rest/message', 'ResourceCreated,ReconciliationDiscrepancy,DecomApproved', 'sec_gaharu_bpmn_tok_4491******', TRUE, 5, 3000),
('Salesforce-BSS-Service-Sync', 'CRM_SALESFORCE', 'https://crm.netstream.corp/services/apexrest/inventorySync', 'ServiceStateChanged,BandwidthUpdated', 'sec_sfdc_live_9921******', TRUE, 3, 5000)
ON CONFLICT DO NOTHING;

-- 7. Webhook Delivery Logs
INSERT INTO integration.webhook_logs (
    subscription_id, event_topic, payload_json, dispatched_at, response_code, response_body, latency_ms, status
) VALUES
(1, 'AlarmCritical', '{"alarmId": "ALM-20260914-001", "severity": "CRITICAL", "device": "JKT-CORE-PE-01", "circuit": "LL-TELKOM-EPL-10G-01"}', CURRENT_TIMESTAMP - INTERVAL '11 minutes', 201, '{"result": "INCIDENT_CREATED", "sys_id": "inc_99014"}', 184, 'DELIVERED'),
(2, 'ReconciliationDiscrepancy', '{"recId": 5, "discrepancy": "OPTICAL_ATTENUATION_BREACH", "circuit": "CBL-TRK-JKT-BDG-01"}', CURRENT_TIMESTAMP - INTERVAL '29 minutes', 200, '{"processInstanceId": "GAHARU-BPMN-OTDR-202609-00891"}', 92, 'DELIVERED')
ON CONFLICT DO NOTHING;
