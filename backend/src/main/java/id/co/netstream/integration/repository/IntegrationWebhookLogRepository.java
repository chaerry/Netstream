package id.co.netstream.integration.repository;

import id.co.netstream.integration.domain.entity.IntegrationWebhookLogEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class IntegrationWebhookLogRepository implements PanacheRepository<IntegrationWebhookLogEntity> {
    public List<IntegrationWebhookLogEntity> findBySubscriptionId(Long subscriptionId) {
        return list("subscription.id = ?1 order by dispatchedAt desc", subscriptionId);
    }

    public List<IntegrationWebhookLogEntity> listRecent(int limit) {
        return find("order by dispatchedAt desc").page(0, limit).list();
    }
}
