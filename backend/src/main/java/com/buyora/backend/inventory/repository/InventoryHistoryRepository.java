package com.buyora.backend.inventory.repository;

import com.buyora.backend.inventory.entity.InventoryHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {

    Page<InventoryHistory> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Page<InventoryHistory> findByProduct_VendorIdOrderByCreatedAtDesc(Long vendorId, Pageable pageable);
}
