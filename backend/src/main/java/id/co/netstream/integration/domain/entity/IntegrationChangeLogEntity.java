package id.co.netstream.integration.domain.entity;

import id.co.netstream.integration.domain.enums.ChangeAction;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(schema = "integration", name = "change_logs")
public class IntegrationChangeLogEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "timestamp")
    public OffsetDateTime timestamp;

    @Column(name = "username", nullable = false, length = 100)
    public String username;

    @Column(name = "user_role", length = 50)
    public String userRole;

    @Column(name = "client_ip", length = 50)
    public String clientIp;

    @Column(name = "entity_domain", nullable = false, length = 50)
    public String entityDomain;

    @Column(name = "entity_type", nullable = false, length = 50)
    public String entityType;

    @Column(name = "entity_id", nullable = false, length = 100)
    public String entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 30)
    public ChangeAction action;

    @Column(name = "summary", nullable = false, columnDefinition = "TEXT")
    public String summary;

    @Column(name = "before_snapshot_json", columnDefinition = "jsonb")
    public String beforeSnapshotJson;

    @Column(name = "after_snapshot_json", columnDefinition = "jsonb")
    public String afterSnapshotJson;

    @Column(name = "diff_summary_json", columnDefinition = "jsonb")
    public String diffSummaryJson;

    @PrePersist
    public void onPrePersist() {
        if (timestamp == null) timestamp = OffsetDateTime.now();
        if (username == null) username = "system";
        if (userRole == null) userRole = "TELECOM_ENGINEER";
    }
}
