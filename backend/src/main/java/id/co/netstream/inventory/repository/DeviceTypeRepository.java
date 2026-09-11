package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.DeviceTypeEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class DeviceTypeRepository implements PanacheRepositoryBase<DeviceTypeEntity, String> {

    public List<DeviceTypeEntity> findActive() {
        return list("isActive = true order by displayOrder asc, name asc");
    }
}
