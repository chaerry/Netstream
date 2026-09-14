package id.co.netstream.integration.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(schema = "integration", name = "webhook_subscriptions")
public class IntegrationWebhookSubscriptionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "name", nullable = false, length = 100)
    public String name;

    @Column(name = "subscriber_system", nullable = false, length = 100)
    public String subscriberSystem;

    @Column(name = "target_url", nullable = false, length = 255)
    public String targetUrl;

    @Column(name = "event_topics", nullable = false, columnDefinition = "TEXT")
    public String eventTopics;

    @Column(name = "secret_token", nullable = false, length = 255)
    public String secretToken;

    @Column(name = "is_active")
    public Boolean isActive;

    @Column(name = "retry_count")
    public Integer retryCount;

    @Column(name = "timeout_ms")
    public Integer timeoutMs;

    @Column(name = "created_at")
    public OffsetDateTime createdAt;

    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
        if (isActive == null) isActive = true;
        if (retryCount == null) retryCount = 3;
        if (timeoutMs == null) timeoutMs = 5000;
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
