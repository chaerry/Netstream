package id.co.netstream.integration.repository;

import id.co.netstream.integration.domain.entity.IntegrationWebhookSubscriptionEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class IntegrationWebhookSubscriptionRepository implements PanacheRepository<IntegrationWebhookSubscriptionEntity> {
    public List<IntegrationWebhookSubscriptionEntity> findActive() {
        return list("isActive = true order by name asc");
    }

    public List<IntegrationWebhookSubscriptionEntity> findByTopic(String topic) {
        return list("isActive = true and eventTopics like ?1", "%" + topic + "%");
    }
}
