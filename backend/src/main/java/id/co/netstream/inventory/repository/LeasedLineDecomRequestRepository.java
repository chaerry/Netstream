package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.LeasedLineDecomRequestEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class LeasedLineDecomRequestRepository implements PanacheRepositoryBase<LeasedLineDecomRequestEntity, String> {

    public List<LeasedLineDecomRequestEntity> findByCircuitId(String circuitId) {
        return list("circuitId = ?1 order by createdAt desc", circuitId);
    }
}
