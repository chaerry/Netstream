package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.LeasedLineCarrierEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class LeasedLineCarrierRepository implements PanacheRepositoryBase<LeasedLineCarrierEntity, String> {

    public Optional<LeasedLineCarrierEntity> findByCode(String code) {
        return find("code", code).firstResultOptional();
    }
}
