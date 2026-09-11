package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.LeasedLineContractEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class LeasedLineContractRepository implements PanacheRepositoryBase<LeasedLineContractEntity, String> {

    public Optional<LeasedLineContractEntity> findByContractNumber(String contractNumber) {
        return find("contractNumber", contractNumber).firstResultOptional();
    }

    public List<LeasedLineContractEntity> findByCarrierId(String carrierId) {
        return list("carrierId = ?1 order by startDate desc", carrierId);
    }
}
