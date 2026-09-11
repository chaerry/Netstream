-- ==============================================================================
-- NETSTREAM TELECOM INVENTORY PLATFORM
-- MODULE 3: LEASED LINE MANAGEMENT SCHEMA (VC4 S2C MODEL)
-- Currency Standard: USD ($)
-- ==============================================================================

SET search_path TO inventory, public;

-- 1. Leased Line Carriers / Providers (3rd-Party Telcos & Internal Divisions)
CREATE TABLE IF NOT EXISTS leased_line_carrier (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    carrier_type VARCHAR(32) NOT NULL DEFAULT 'EXTERNAL_OPERATOR', -- EXTERNAL_OPERATOR, INTERNAL_WHOLESALE, CONSORTIUM
    contact_person VARCHAR(128),
    contact_email VARCHAR(128),
    contact_phone VARCHAR(64),
    portal_url VARCHAR(255),
    support_tier VARCHAR(32) DEFAULT 'TIER_1_ENTERPRISE',
    escalation_matrix TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Service Agreements & Service Order Contracts
CREATE TABLE IF NOT EXISTS leased_line_contract (
    id VARCHAR(64) PRIMARY KEY,
    carrier_id VARCHAR(64) REFERENCES leased_line_carrier(id) ON DELETE SET NULL,
    contract_number VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(128) NOT NULL,
    contract_type VARCHAR(32) NOT NULL DEFAULT 'MSA', -- MSA, SERVICE_ORDER, IRU, SLA_SCHEDULE
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    term_months INT NOT NULL DEFAULT 12,
    auto_renewal BOOLEAN DEFAULT true,
    notice_period_days INT DEFAULT 60,
    currency VARCHAR(8) DEFAULT 'USD',
    mrc_total NUMERIC(15, 2) DEFAULT 0.00,
    nrc_total NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRING_SOON, EXPIRED, TERMINATED
    document_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leased Line Circuits (Core Inventory & Financial Association)
CREATE TABLE IF NOT EXISTS leased_line_circuit (
    id VARCHAR(64) PRIMARY KEY,
    circuit_id VARCHAR(64) NOT NULL UNIQUE,          -- Internal Carrier Circuit ID e.g. LL-US-NYC-LON-100G
    carrier_circuit_id VARCHAR(64),                  -- 3rd-party Provider Circuit ID e.g. TELKOM-CKT-9921
    circuit_name VARCHAR(128) NOT NULL,
    direction VARCHAR(32) NOT NULL DEFAULT 'INBOUND_RENTED', -- INBOUND_RENTED (Off-Net), OUTBOUND_CUSTOMER (On-Net)
    technology VARCHAR(32) NOT NULL DEFAULT 'EPL',    -- EPL, EVPL, DIA, DARK_FIBER, DWDM_LAMBDA, SDH_VC4
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',    -- PLANNING, PROVISIONING, ACTIVE, SUSPENDED, DORMANT, PENDING_DECOMMISSION, TERMINATED
    carrier_id VARCHAR(64) REFERENCES leased_line_carrier(id) ON DELETE SET NULL,
    contract_id VARCHAR(64) REFERENCES leased_line_contract(id) ON DELETE SET NULL,
    
    -- Technical Specifications
    bandwidth_mbps INT NOT NULL DEFAULT 1000,
    bandwidth_display VARCHAR(32) DEFAULT '1 Gbps',
    sla_tier VARCHAR(32) DEFAULT 'GOLD_99_99',      -- PLATINUM_99_999, GOLD_99_99, SILVER_99_95, BRONZE_99_90
    uptime_target_percent NUMERIC(5, 3) DEFAULT 99.990,
    mttr_target_hours NUMERIC(4, 1) DEFAULT 4.0,
    committed_latency_ms NUMERIC(6, 2) DEFAULT 15.00,
    actual_latency_ms NUMERIC(6, 2) DEFAULT 12.40,
    jitter_ms NUMERIC(5, 2) DEFAULT 1.20,
    packet_loss_percent NUMERIC(4, 3) DEFAULT 0.001,
    
    -- Physical & Logical Inventory Mapping
    a_end_location_id VARCHAR(64) REFERENCES location(id) ON DELETE SET NULL,
    a_end_device_id VARCHAR(64) REFERENCES network_device(id) ON DELETE SET NULL,
    a_end_port_id VARCHAR(64) REFERENCES device_port(id) ON DELETE SET NULL,
    z_end_location_id VARCHAR(64) REFERENCES location(id) ON DELETE SET NULL,
    z_end_device_id VARCHAR(64) REFERENCES network_device(id) ON DELETE SET NULL,
    z_end_port_id VARCHAR(64) REFERENCES device_port(id) ON DELETE SET NULL,
    optical_cable_id VARCHAR(64) REFERENCES optical_cable(id) ON DELETE SET NULL,
    strand_number INT,
    vne_id VARCHAR(64) REFERENCES virtual_network_element(id) ON DELETE SET NULL,
    vlan_id INT,
    
    -- Commercial & Customer Mapping
    customer_id VARCHAR(64),
    customer_name VARCHAR(128),
    service_id VARCHAR(64) REFERENCES network_service(id) ON DELETE SET NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    mrc NUMERIC(15, 2) NOT NULL DEFAULT 0.00,        -- Monthly Recurring Charge
    nrc NUMERIC(15, 2) NOT NULL DEFAULT 0.00,        -- Non-Recurring Charge
    
    -- Capacity & Utilization Tracking (OpEx Reduction Engine)
    utilization_percent NUMERIC(5, 2) DEFAULT 0.00,
    is_dormant BOOLEAN DEFAULT false,                -- Flagged if 0 child services or <1% utilization
    dormant_since DATE,
    potential_monthly_savings NUMERIC(15, 2) DEFAULT 0.00,
    
    activation_date DATE,
    decommission_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Automated Vendor Invoice Auditing & Reconciliation
CREATE TABLE IF NOT EXISTS leased_line_invoice (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    carrier_id VARCHAR(64) REFERENCES leased_line_carrier(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    billed_amount NUMERIC(15, 2) NOT NULL,
    contracted_amount NUMERIC(15, 2) NOT NULL,
    sla_penalty_credit NUMERIC(15, 2) DEFAULT 0.00,
    net_payable_amount NUMERIC(15, 2) NOT NULL,
    discrepancy_amount NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'AUDITED_OK',          -- RECEIVED, AUDITED_OK, DISCREPANCY_FLAGGED, DISPUTED, APPROVED_FOR_PAYMENT
    dispute_reason TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Invoice Line Items (Circuit-by-Circuit Audit)
CREATE TABLE IF NOT EXISTS leased_line_invoice_item (
    id VARCHAR(64) PRIMARY KEY,
    invoice_id VARCHAR(64) REFERENCES leased_line_invoice(id) ON DELETE CASCADE,
    circuit_id VARCHAR(64) REFERENCES leased_line_circuit(id) ON DELETE SET NULL,
    circuit_reference VARCHAR(64) NOT NULL,
    billed_mrc NUMERIC(15, 2) NOT NULL,
    contracted_mrc NUMERIC(15, 2) NOT NULL,
    discrepancy NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'VERIFIED',            -- VERIFIED, RATE_MISMATCH, CANCELLED_CIRCUIT_BILLED, UNKNOWN_CIRCUIT
    notes TEXT
);

-- 6. SLA Outage Incidents & Penalty Rebate Tracking
CREATE TABLE IF NOT EXISTS leased_line_sla_incident (
    id VARCHAR(64) PRIMARY KEY,
    circuit_id VARCHAR(64) REFERENCES leased_line_circuit(id) ON DELETE CASCADE,
    ticket_number VARCHAR(64) NOT NULL UNIQUE,
    carrier_ticket_number VARCHAR(64),
    incident_start TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INT DEFAULT 0,
    target_mttr_minutes INT DEFAULT 240,             -- 4 hours
    is_mttr_breached BOOLEAN DEFAULT false,
    outage_type VARCHAR(32) DEFAULT 'FIBER_CUT',     -- FIBER_CUT, HARDWARE_FAILURE, BGP_ROUTING, POWER_OUTAGE
    root_cause TEXT,
    currency VARCHAR(8) DEFAULT 'USD',
    penalty_rebate_amount NUMERIC(15, 2) DEFAULT 0.00,
    claim_status VARCHAR(32) DEFAULT 'PENDING_CLAIM', -- PENDING_CLAIM, CLAIM_SUBMITTED, CREDITED_BY_CARRIER, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Gaharu BPMN Decommissioning Workflow Bridge
CREATE TABLE IF NOT EXISTS leased_line_decom_request (
    id VARCHAR(64) PRIMARY KEY,
    circuit_id VARCHAR(64) REFERENCES leased_line_circuit(id) ON DELETE CASCADE,
    gaharu_process_instance_id VARCHAR(128),
    initiated_by VARCHAR(64) NOT NULL,
    reason VARCHAR(128) NOT NULL,
    target_decom_date DATE NOT NULL,
    estimated_annual_savings NUMERIC(15, 2) DEFAULT 0.00,
    workflow_state VARCHAR(32) DEFAULT 'BPMN_SUBMITTED', -- BPMN_SUBMITTED, CARRIER_NOTIFIED, PHYSICAL_DISCONNECT, BILLING_CEASED, CLOSED
    gaharu_response_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- REALISTIC SEED DATA FOR LEASED LINE MODULE
-- ==============================================================================

-- Carriers
INSERT INTO leased_line_carrier (id, name, code, carrier_type, contact_person, contact_email, contact_phone, portal_url, support_tier)
VALUES
('CARRIER-01', 'Lumen Technologies Global', 'LUMEN', 'EXTERNAL_OPERATOR', 'Sarah Jenkins', 'noc-escalations@lumen.com', '+1-800-888-3333', 'https://control.lumen.com', 'TIER_1_ENTERPRISE'),
('CARRIER-02', 'Singtel Enterprise Carrier Services', 'SINGTEL', 'EXTERNAL_OPERATOR', 'Lim Wei Meng', 'enterprise-noc@singtel.com', '+65-6838-8888', 'https://bridge.singtel.com', 'TIER_1_ENTERPRISE'),
('CARRIER-03', 'Telkom Indonesia Wholesale', 'TELKOM-ID', 'EXTERNAL_OPERATOR', 'Bambang Sudiro', 'wholesale-support@telkom.co.id', '+62-21-5240-1234', 'https://wholesale.telkom.co.id', 'TIER_1_ENTERPRISE'),
('CARRIER-04', 'Indosat Ooredoo Hutchison', 'IOH', 'EXTERNAL_OPERATOR', 'Rini Handayani', 'carrier.services@ioh.co.id', '+62-21-3000-3000', 'https://mycarrier.ioh.co.id', 'TIER_1_ENTERPRISE'),
('CARRIER-05', 'Colt Technology Services', 'COLT', 'EXTERNAL_OPERATOR', 'Alexandre Mercier', 'colt-noc@colt.net', '+44-20-7863-5000', 'https://portal.colt.net', 'TIER_1_ENTERPRISE')
ON CONFLICT (id) DO NOTHING;

-- Contracts
INSERT INTO leased_line_contract (id, carrier_id, contract_number, title, contract_type, start_date, end_date, term_months, auto_renewal, notice_period_days, currency, mrc_total, nrc_total, status)
VALUES
('CTR-LUMEN-2025', 'CARRIER-01', 'MSA-LUMEN-INTL-2025', 'Trans-Pacific & Global Transit Capacity MSA', 'MSA', '2025-01-01', '2027-12-31', 36, true, 60, 'USD', 24500.00, 5000.00, 'ACTIVE'),
('CTR-SINGTEL-2025', 'CARRIER-02', 'SO-SINGTEL-SG-JKT-09', 'Singapore-Jakarta Dark Fiber & DWDM Capacity', 'SERVICE_ORDER', '2024-06-01', '2026-05-31', 24, true, 45, 'USD', 18200.00, 3500.00, 'ACTIVE'),
('CTR-TELKOM-2025', 'CARRIER-03', 'TELKOM-DOM-TAIL-2025', 'Domestic Java-Bali Aggregation Tails', 'SERVICE_ORDER', '2024-01-01', '2025-12-31', 24, false, 30, 'USD', 12400.00, 2000.00, 'ACTIVE'),
('CTR-IOH-2024', 'CARRIER-04', 'IOH-SURABAYA-METRO', 'Surabaya Metro Redundant Feeder EPL', 'SERVICE_ORDER', '2023-09-01', '2025-08-31', 24, false, 30, 'USD', 6500.00, 1200.00, 'EXPIRING_SOON')
ON CONFLICT (id) DO NOTHING;

-- Leased Line Circuits
INSERT INTO leased_line_circuit (
    id, circuit_id, carrier_circuit_id, circuit_name, direction, technology, status, carrier_id, contract_id,
    bandwidth_mbps, bandwidth_display, sla_tier, uptime_target_percent, mttr_target_hours, committed_latency_ms,
    actual_latency_ms, jitter_ms, packet_loss_percent, currency, mrc, nrc, utilization_percent, is_dormant,
    dormant_since, potential_monthly_savings, activation_date, notes
)
VALUES
(
    'CKT-001', 'LL-GLOBAL-SG-JKT-100G', 'ST-DWDM-99410', 'Singapore Equinix SG1 to Jakarta Cyber 1 (100G DWDM)',
    'INBOUND_RENTED', 'DWDM_LAMBDA', 'ACTIVE', 'CARRIER-02', 'CTR-SINGTEL-2025',
    100000, '100 Gbps', 'PLATINUM_99_999', 99.999, 2.0, 9.80, 8.45, 0.40, 0.000,
    'USD', 14500.00, 2500.00, 84.50, false, NULL, 0.00, '2024-06-15',
    'Primary international backbone gateway connecting SGX and IndoKeppel submarine landing.'
),
(
    'CKT-002', 'LL-P2P-JKT-BDG-10G', 'TLK-EPL-88120', 'Jakarta Cyber 1 to Bandung Dago POP (10G EPL)',
    'INBOUND_RENTED', 'EPL', 'ACTIVE', 'CARRIER-03', 'CTR-TELKOM-2025',
    10000, '10 Gbps', 'GOLD_99_99', 99.990, 4.0, 4.50, 3.80, 0.80, 0.001,
    'USD', 4200.00, 800.00, 68.20, false, NULL, 0.00, '2024-02-01',
    'High-availability off-net transit tail leased from Telkom Indonesia.'
),
(
    'CKT-003', 'LL-DIA-HQ-CORP-10G', 'INT-NET-DIA-001', 'Bank Central Asia Corporate HQ (10G Dedicated Internet)',
    'OUTBOUND_CUSTOMER', 'DIA', 'ACTIVE', NULL, NULL,
    10000, '10 Gbps', 'PLATINUM_99_999', 99.999, 2.0, 2.00, 1.45, 0.20, 0.000,
    'USD', 7800.00, 1500.00, 45.30, false, NULL, 0.00, '2024-04-10',
    'Enterprise customer retail leased line with symmetrical DIA and /28 public IP assignment.'
),
(
    'CKT-004', 'LL-DORMANT-SBY-MLG-1G', 'IOH-CKT-44319', 'Surabaya Rungkut to Malang Outer Branch (1G EVPL)',
    'INBOUND_RENTED', 'EVPL', 'DORMANT', 'CARRIER-04', 'CTR-IOH-2024',
    1000, '1 Gbps', 'SILVER_99_95', 99.950, 6.0, 12.00, 11.20, 1.80, 0.005,
    'USD', 2800.00, 500.00, 0.20, true, '2025-06-01', 2800.00, '2023-09-15',
    'FLAGGED BY OPEX ENGINE: Customer relocated branch 3 months ago. Zero active services. Paying $2,800/mo waste. Eligible for Gaharu BPMN cancellation.'
),
(
    'CKT-005', 'LL-FIN-TRADING-P2P', 'LMN-ULTRA-009', 'SCBD Financial Trading Center to Cyber 2 Ultra-Low Latency',
    'OUTBOUND_CUSTOMER', 'EPL', 'ACTIVE', 'CARRIER-01', 'CTR-LUMEN-2025',
    5000, '5 Gbps', 'PLATINUM_99_999', 99.999, 1.5, 0.85, 0.72, 0.10, 0.000,
    'USD', 9500.00, 2000.00, 39.80, false, NULL, 0.00, '2025-01-15',
    'Sub-millisecond high-frequency trading circuit for investment brokerage.'
),
(
    'CKT-006', 'LL-DARKFIBER-JKT-LOOP', 'TLK-DF-LOOP-02', 'Jakarta Ring Metro Dark Fiber Core Pair (Unlit Lease)',
    'INBOUND_RENTED', 'DARK_FIBER', 'ACTIVE', 'CARRIER-03', 'CTR-TELKOM-2025',
    0, 'Dark Fiber (Pair)', 'GOLD_99_99', 99.990, 4.0, 0.00, 0.00, 0.00, 0.000,
    'USD', 5400.00, 1200.00, 100.00, false, NULL, 0.00, '2024-01-20',
    'Unlit dark fiber leased pair lit using Netstream coherent 400G transponders.'
)
ON CONFLICT (id) DO NOTHING;

-- Invoices
INSERT INTO leased_line_invoice (
    id, invoice_number, carrier_id, billing_period_start, billing_period_end,
    currency, billed_amount, contracted_amount, sla_penalty_credit, net_payable_amount,
    discrepancy_amount, status, dispute_reason, invoice_date, due_date
)
VALUES
(
    'INV-2025-001', 'INV-ST-AUG-9941', 'CARRIER-02', '2025-08-01', '2025-08-31',
    'USD', 18200.00, 18200.00, 750.00, 17450.00,
    0.00, 'AUDITED_OK', NULL, '2025-09-01', '2025-09-30'
),
(
    'INV-2025-002', 'INV-TLK-AUG-8821', 'CARRIER-03', '2025-08-01', '2025-08-31',
    'USD', 13600.00, 12400.00, 0.00, 12400.00,
    1200.00, 'DISCREPANCY_FLAGGED', 'Overbilled $1,200 for decommissioned tail ckt CKT-OLD-099 that was terminated in July 2025.',
    '2025-09-02', '2025-10-02'
),
(
    'INV-2025-003', 'INV-LMN-AUG-3310', 'CARRIER-01', '2025-08-01', '2025-08-31',
    'USD', 24500.00, 24500.00, 1200.00, 23300.00,
    0.00, 'APPROVED_FOR_PAYMENT', NULL, '2025-09-01', '2025-09-30'
)
ON CONFLICT (id) DO NOTHING;

-- SLA Outage Incidents
INSERT INTO leased_line_sla_incident (
    id, circuit_id, ticket_number, carrier_ticket_number, incident_start, incident_end,
    duration_minutes, target_mttr_minutes, is_mttr_breached, outage_type, root_cause,
    currency, penalty_rebate_amount, claim_status
)
VALUES
(
    'INC-2025-081', 'CKT-001', 'INC-NOC-9921', 'SINGTEL-TT-448102',
    '2025-08-14 02:15:00+00', '2025-08-14 06:45:00+00', 270, 120, true,
    'FIBER_CUT', 'Submarine cable shunt fault 42km off Batam island during anchor dragging.',
    'USD', 750.00, 'CLAIM_SUBMITTED'
),
(
    'INC-2025-082', 'CKT-002', 'INC-NOC-9955', 'TLK-TT-119283',
    '2025-08-20 14:00:00+00', '2025-08-20 15:30:00+00', 90, 240, false,
    'HARDWARE_FAILURE', 'EDFA optical amplifier card swap at Purwakarta regeneration shelter.',
    'USD', 0.00, 'CREDITED_BY_CARRIER'
)
ON CONFLICT (id) DO NOTHING;

-- Decommissioning Requests (Gaharu BPMN NGIN Bridge)
INSERT INTO leased_line_decom_request (
    id, circuit_id, gaharu_process_instance_id, initiated_by, reason, target_decom_date,
    estimated_annual_savings, workflow_state, gaharu_response_payload
)
VALUES
(
    'DCM-2025-001', 'CKT-004', 'gaharu_bpmn_inst_994812_leased_line_cancellation',
    'telecom_planner', 'Zero customer services attached; branch closed; save $2,800/month OpEx',
    '2025-09-30', 33600.00, 'BPMN_SUBMITTED',
    '{"status":"RUNNING","processDefinitionKey":"leased_line_decom_v1","assignedToGroup":"CARRIER_RELATIONS","milestones":["LEGAL_NOTICE_SENT","PHYSICAL_PORT_SHUTDOWN","FINAL_BILL_RECONCILIATION"]}'
)
ON CONFLICT (id) DO NOTHING;
