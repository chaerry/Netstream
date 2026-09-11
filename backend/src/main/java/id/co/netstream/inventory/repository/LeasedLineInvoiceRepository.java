package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.LeasedLineInvoiceEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class LeasedLineInvoiceRepository implements PanacheRepositoryBase<LeasedLineInvoiceEntity, String> {

    public Optional<LeasedLineInvoiceEntity> findByInvoiceNumber(String invoiceNumber) {
        return find("invoiceNumber", invoiceNumber).firstResultOptional();
    }

    public List<LeasedLineInvoiceEntity> findByCarrierId(String carrierId) {
        return list("carrierId = ?1 order by invoiceDate desc", carrierId);
    }
}
