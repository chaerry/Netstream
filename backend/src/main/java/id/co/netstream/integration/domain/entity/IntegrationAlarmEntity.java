package id.co.netstream.integration.domain.entity;

import id.co.netstream.integration.domain.enums.AlarmLifecycleStatus;
import id.co.netstream.integration.domain.enums.AlarmSeverity;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(schema = "integration", name = "alarms")
public class IntegrationAlarmEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "alarm_identifier", nullable = false, unique = true, length = 100)
    public String alarmIdentifier;

    @Column(name = "source_system", nullable = false, length = 50)
    public String sourceSystem;

    @Column(name = "source_ip", length = 50)
    public String sourceIp;

    @Column(name = "alarm_name", nullable = false, length = 150)
    public String alarmName;

    @Column(name = "alarm_type", nullable = false, length = 50)
    public String alarmType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    public AlarmSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "lifecycle_status", nullable = false, length = 50)
    public AlarmLifecycleStatus lifecycleStatus;

    @Column(name = "raised_at")
    public OffsetDateTime raisedAt;

    @Column(name = "cleared_at")
    public OffsetDateTime clearedAt;

    @Column(name = "acknowledged_by", length = 100)
    public String acknowledgedBy;

    @Column(name = "acknowledged_at")
    public OffsetDateTime acknowledgedAt;

    @Column(name = "raw_payload_json", columnDefinition = "jsonb")
    public String rawPayloadJson;

    // TELECOM ENRICHED TOPOLOGY LINKAGES
    @Column(name = "device_id")
    public Long deviceId;

    @Column(name = "device_name", length = 100)
    public String deviceName;

    @Column(name = "port_id")
    public Long portId;

    @Column(name = "port_name", length = 100)
    public String portName;

    @Column(name = "location_name", length = 100)
    public String locationName;

    @Column(name = "rack_code", length = 50)
    public String rackCode;

    @Column(name = "optical_cable_code", length = 100)
    public String opticalCableCode;

    @Column(name = "optical_strand_no")
    public Integer opticalStrandNo;

    @Column(name = "leased_line_circuit_code", length = 100)
    public String leasedLineCircuitCode;

    @Column(name = "carrier_name", length = 100)
    public String carrierName;

    @Column(name = "sla_tier", length = 30)
    public String slaTier;

    @Column(name = "impacted_services_count")
    public Integer impactedServicesCount;

    @Column(name = "impacted_customers_count")
    public Integer impactedCustomersCount;

    @Column(name = "estimated_revenue_risk_usd", precision = 15, scale = 2)
    public BigDecimal estimatedRevenueRiskUsd;

    @Column(name = "gaharu_ticket_id", length = 100)
    public String gaharuTicketId;

    @Column(name = "root_cause_tag", length = 100)
    public String rootCauseTag;

    @PrePersist
    public void onPrePersist() {
        if (raisedAt == null) raisedAt = OffsetDateTime.now();
        if (lifecycleStatus == null) lifecycleStatus = AlarmLifecycleStatus.ACTIVE_UNACKNOWLEDGED;
        if (impactedServicesCount == null) impactedServicesCount = 0;
        if (impactedCustomersCount == null) impactedCustomersCount = 0;
        if (estimatedRevenueRiskUsd == null) estimatedRevenueRiskUsd = BigDecimal.ZERO;
    }
}
