package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.CableStrandEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class CableStrandRepository implements PanacheRepositoryBase<CableStrandEntity, UUID> {

    public List<CableStrandEntity> findByCableId(UUID cableId) {
        return list("cable.id = ?1 ORDER BY coreNumber ASC", cableId);
    }

    public Optional<CableStrandEntity> findByCableAndCore(UUID cableId, Integer coreNumber) {
        return find("cable.id = ?1 AND coreNumber = ?2", cableId, coreNumber).firstResultOptional();
    }
}
