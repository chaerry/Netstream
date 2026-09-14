package id.co.netstream.integration.repository;

import id.co.netstream.integration.domain.entity.IntegrationReconciliationItemEntity;
import id.co.netstream.integration.domain.enums.DiscrepancyType;
import id.co.netstream.integration.domain.enums.ReconciliationStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class IntegrationReconciliationItemRepository implements PanacheRepository<IntegrationReconciliationItemEntity> {
    public List<IntegrationReconciliationItemEntity> findByStatus(ReconciliationStatus status) {
        return list("status = ?1 order by createdAt desc", status);
    }

    public List<IntegrationReconciliationItemEntity> findByDiscrepancyType(DiscrepancyType type) {
        return list("discrepancyType = ?1 order by createdAt desc", type);
    }

    public List<IntegrationReconciliationItemEntity> findPendingReview() {
        return list("status = ?1 order by severity desc, createdAt desc", ReconciliationStatus.PENDING_REVIEW);
    }
}
