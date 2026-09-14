package id.co.netstream.integration.repository;

import id.co.netstream.integration.domain.entity.IntegrationConnectorEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class IntegrationConnectorRepository implements PanacheRepository<IntegrationConnectorEntity> {
    public List<IntegrationConnectorEntity> findByVendor(String vendor) {
        return list("vendor", vendor);
    }

    public List<IntegrationConnectorEntity> findByStatus(String status) {
        return list("status", status);
    }
}
