package id.co.netstream.integration.repository;

import id.co.netstream.integration.domain.entity.IntegrationChangeLogEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class IntegrationChangeLogRepository implements PanacheRepository<IntegrationChangeLogEntity> {
    public List<IntegrationChangeLogEntity> listRecent(int limit) {
        return find("order by timestamp desc").page(0, limit).list();
    }

    public List<IntegrationChangeLogEntity> findByEntityDomain(String domain) {
        return list("entityDomain = ?1 order by timestamp desc", domain);
    }

    public List<IntegrationChangeLogEntity> findByEntity(String entityType, String entityId) {
        return list("entityType = ?1 and entityId = ?2 order by timestamp desc", entityType, entityId);
    }
}
