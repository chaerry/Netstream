package id.co.netstream.integration.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(schema = "integration", name = "webhook_logs")
public class IntegrationWebhookLogEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    public IntegrationWebhookSubscriptionEntity subscription;

    @Column(name = "event_topic", nullable = false, length = 100)
    public String eventTopic;

    @Column(name = "payload_json", nullable = false, columnDefinition = "jsonb")
    public String payloadJson;

    @Column(name = "dispatched_at")
    public OffsetDateTime dispatchedAt;

    @Column(name = "response_code")
    public Integer responseCode;

    @Column(name = "response_body", columnDefinition = "TEXT")
    public String responseBody;

    @Column(name = "latency_ms")
    public Integer latencyMs;

    @Column(name = "status", nullable = false, length = 20)
    public String status;

    @PrePersist
    public void onPrePersist() {
        if (dispatchedAt == null) dispatchedAt = OffsetDateTime.now();
        if (status == null) status = "DELIVERED";
    }
}
