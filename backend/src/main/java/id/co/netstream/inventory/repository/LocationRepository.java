package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.LocationEntity;
import id.co.netstream.inventory.domain.enums.LocationType;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class LocationRepository implements PanacheRepositoryBase<LocationEntity, UUID> {

    public Optional<LocationEntity> findByCode(String code) {
        return find("code", code).firstResultOptional();
    }

    public List<LocationEntity> findRoots() {
        return list("parentId is null order by name asc");
    }

    public List<LocationEntity> findByParentId(UUID parentId) {
        return list("parentId = ?1 order by name asc", parentId);
    }

    public List<LocationEntity> findByType(LocationType type) {
        return list("type = ?1 order by name asc", type);
    }
}
