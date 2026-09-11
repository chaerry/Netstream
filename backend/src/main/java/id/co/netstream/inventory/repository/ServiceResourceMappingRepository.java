package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.ServiceResourceMappingEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ServiceResourceMappingRepository implements PanacheRepositoryBase<ServiceResourceMappingEntity, UUID> {

    public List<ServiceResourceMappingEntity> findByServiceId(UUID serviceId) {
        return list("service.id = ?1 order by hopOrder asc", serviceId);
    }

    public List<ServiceResourceMappingEntity> findByDeviceId(UUID deviceId) {
        return list("deviceId = ?1", deviceId);
    }

    public java.util.Optional<ServiceResourceMappingEntity> findByPortId(UUID portId) {
        return find("portId = ?1", portId).firstResultOptional();
    }
}
