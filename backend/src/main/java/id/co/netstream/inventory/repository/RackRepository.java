package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.RackEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class RackRepository implements PanacheRepositoryBase<RackEntity, UUID> {

    public List<RackEntity> findByLocationId(UUID locationId) {
        return list("locationId = ?1 order by rackNumber asc", locationId);
    }

    public Optional<RackEntity> findByLocationAndNumber(UUID locationId, String rackNumber) {
        return find("locationId = ?1 and rackNumber = ?2", locationId, rackNumber).firstResultOptional();
    }
}
