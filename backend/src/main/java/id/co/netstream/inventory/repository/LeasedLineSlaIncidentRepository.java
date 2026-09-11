package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.LeasedLineSlaIncidentEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class LeasedLineSlaIncidentRepository implements PanacheRepositoryBase<LeasedLineSlaIncidentEntity, String> {

    public List<LeasedLineSlaIncidentEntity> findByCircuitId(String circuitId) {
        return list("circuitId = ?1 order by incidentStart desc", circuitId);
    }
}
