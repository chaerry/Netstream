package id.co.netstream.integration.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(schema = "integration", name = "discovery_jobs")
public class IntegrationDiscoveryJobEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connector_id", nullable = false)
    public IntegrationConnectorEntity connector;

    @Column(name = "job_type", nullable = false, length = 50)
    public String jobType;

    @Column(name = "status", nullable = false, length = 30)
    public String status;

    @Column(name = "started_at")
    public OffsetDateTime startedAt;

    @Column(name = "completed_at")
    public OffsetDateTime completedAt;

    @Column(name = "elements_scanned")
    public Integer elementsScanned;

    @Column(name = "discrepancies_found")
    public Integer discrepanciesFound;

    @Column(name = "error_message", columnDefinition = "TEXT")
    public String errorMessage;

    @Column(name = "initiated_by", length = 100)
    public String initiatedBy;

    @PrePersist
    public void onPrePersist() {
        if (startedAt == null) startedAt = OffsetDateTime.now();
        if (status == null) status = "RUNNING";
        if (elementsScanned == null) elementsScanned = 0;
        if (discrepanciesFound == null) discrepanciesFound = 0;
    }
}
