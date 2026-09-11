package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.LeasedLineCircuitEntity;
import id.co.netstream.inventory.domain.enums.CircuitDirection;
import id.co.netstream.inventory.domain.enums.CircuitLifecycleStatus;
import id.co.netstream.inventory.domain.enums.CircuitTechnology;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@ApplicationScoped
public class LeasedLineCircuitRepository implements PanacheRepositoryBase<LeasedLineCircuitEntity, String> {

    public Optional<LeasedLineCircuitEntity> findByCircuitId(String circuitId) {
        return find("circuitId", circuitId).firstResultOptional();
    }

    public List<LeasedLineCircuitEntity> findDormantCircuits() {
        return list("isDormant = true or status = ?1", CircuitLifecycleStatus.DORMANT);
    }

    public PanacheQuery<LeasedLineCircuitEntity> searchCircuits(
            String query,
            CircuitDirection direction,
            CircuitTechnology technology,
            CircuitLifecycleStatus status,
            String carrierId,
            int pageIndex,
            int pageSize
    ) {
        StringBuilder hql = new StringBuilder("1=1");
        Map<String, Object> params = new HashMap<>();

        if (query != null && !query.trim().isEmpty()) {
            String cleanQuery = query.trim().replaceAll("\\s+", " ").toLowerCase();
            hql.append(" and (lower(circuitId) like :query or lower(circuitName) like :query or lower(coalesce(carrierCircuitId, '')) like :query or lower(coalesce(customerName, '')) like :query)");
            params.put("query", "%" + cleanQuery + "%");
        }
        if (direction != null) {
            hql.append(" and direction = :direction");
            params.put("direction", direction);
        }
        if (technology != null) {
            hql.append(" and technology = :technology");
            params.put("technology", technology);
        }
        if (status != null) {
            hql.append(" and status = :status");
            params.put("status", status);
        }
        if (carrierId != null && !carrierId.trim().isEmpty()) {
            hql.append(" and carrierId = :carrierId");
            params.put("carrierId", carrierId);
        }

        hql.append(" order by circuitId asc");
        return find(hql.toString(), params).page(Page.of(pageIndex, pageSize));
    }
}
