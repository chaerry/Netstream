package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.VirtualNetworkElementEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class VirtualNetworkElementRepository implements PanacheRepositoryBase<VirtualNetworkElementEntity, UUID> {

    public Optional<VirtualNetworkElementEntity> findByName(String name) {
        return find("vneName", name).firstResultOptional();
    }

    public List<VirtualNetworkElementEntity> findByVlanId(int vlanId) {
        return list("vlanId = ?1 order by vneName asc", vlanId);
    }

    public List<VirtualNetworkElementEntity> findByHypervisor(UUID hypervisorId) {
        return list("hypervisorDeviceId = ?1 order by vneName asc", hypervisorId);
    }
}
