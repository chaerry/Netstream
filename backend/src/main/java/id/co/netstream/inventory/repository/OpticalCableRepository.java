package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.OpticalCableEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class OpticalCableRepository implements PanacheRepositoryBase<OpticalCableEntity, UUID> {

    public Optional<OpticalCableEntity> findByCode(String code) {
        return find("cableCode", code).firstResultOptional();
    }
}
