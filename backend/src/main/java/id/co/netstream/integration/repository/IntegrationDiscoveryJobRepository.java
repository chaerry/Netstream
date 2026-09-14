package id.co.netstream.integration.repository;

import id.co.netstream.integration.domain.entity.IntegrationDiscoveryJobEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class IntegrationDiscoveryJobRepository implements PanacheRepository<IntegrationDiscoveryJobEntity> {
    public List<IntegrationDiscoveryJobEntity> findByConnectorId(Long connectorId) {
        return list("connector.id = ?1 order by startedAt desc", connectorId);
    }

    public List<IntegrationDiscoveryJobEntity> listRecentJobs(int limit) {
        return find("order by startedAt desc").page(0, limit).list();
    }
}
