package id.co.netstream.integration.domain.entity;

import id.co.netstream.integration.domain.enums.DiscrepancyType;
import id.co.netstream.integration.domain.enums.ReconciliationStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(schema = "integration", name = "reconciliation_items")
public class IntegrationReconciliationItemEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discovery_job_id")
    public IntegrationDiscoveryJobEntity discoveryJob;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connector_id", nullable = false)
    public IntegrationConnectorEntity connector;

    @Column(name = "entity_type", nullable = false, length = 50)
    public String entityType;

    @Column(name = "entity_identifier", nullable = false, length = 150)
    public String entityIdentifier;

    @Column(name = "target_inventory_id")
    public Long targetInventoryId;

    @Enumerated(EnumType.STRING)
    @Column(name = "discrepancy_type", nullable = false, length = 50)
    public DiscrepancyType discrepancyType;

    @Column(name = "attribute_name", length = 100)
    public String attributeName;

    @Column(name = "inventory_value", columnDefinition = "TEXT")
    public String inventoryValue;

    @Column(name = "live_discovered_value", columnDefinition = "TEXT")
    public String liveDiscoveredValue;

    @Column(name = "severity", nullable = false, length = 20)
    public String severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    public ReconciliationStatus status;

    @Column(name = "resolution_action", length = 50)
    public String resolutionAction;

    @Column(name = "resolved_by", length = 100)
    public String resolvedBy;

    @Column(name = "resolved_at")
    public OffsetDateTime resolvedAt;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    public String resolutionNotes;

    @Column(name = "gaharu_process_instance_id", length = 100)
    public String gaharuProcessInstanceId;

    @Column(name = "created_at")
    public OffsetDateTime createdAt;

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (status == null) status = ReconciliationStatus.PENDING_REVIEW;
        if (severity == null) severity = "MINOR";
    }
}
