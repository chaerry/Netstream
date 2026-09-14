package id.co.netstream.integration.domain.entity;

import id.co.netstream.integration.domain.enums.ConnectorProtocol;
import id.co.netstream.integration.domain.enums.ConnectorStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(schema = "integration", name = "connectors")
public class IntegrationConnectorEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    public String name;

    @Column(name = "vendor", nullable = false, length = 50)
    public String vendor;

    @Column(name = "connector_type", nullable = false, length = 50)
    public String connectorType;

    @Enumerated(EnumType.STRING)
    @Column(name = "protocol", nullable = false, length = 30)
    public ConnectorProtocol protocol;

    @Column(name = "endpoint_url", nullable = false, length = 255)
    public String endpointUrl;

    @Column(name = "auth_type", length = 30)
    public String authType;

    @Column(name = "auth_credential_masked", length = 255)
    public String authCredentialMasked;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    public ConnectorStatus status;

    @Column(name = "ping_latency_ms")
    public Integer pingLatencyMs;

    @Column(name = "sync_interval_mins")
    public Integer syncIntervalMins;

    @Column(name = "auto_reconcile_enabled")
    public Boolean autoReconcileEnabled;

    @Column(name = "auto_approve_minor_diffs")
    public Boolean autoApproveMinorDiffs;

    @Column(name = "last_sync_at")
    public OffsetDateTime lastSyncAt;

    @Column(name = "last_sync_status", length = 50)
    public String lastSyncStatus;

    @Column(name = "managed_elements_count")
    public Integer managedElementsCount;

    @Column(name = "created_at")
    public OffsetDateTime createdAt;

    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
        if (status == null) status = ConnectorStatus.ONLINE;
        if (autoReconcileEnabled == null) autoReconcileEnabled = true;
        if (autoApproveMinorDiffs == null) autoApproveMinorDiffs = true;
        if (syncIntervalMins == null) syncIntervalMins = 60;
        if (managedElementsCount == null) managedElementsCount = 0;
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
