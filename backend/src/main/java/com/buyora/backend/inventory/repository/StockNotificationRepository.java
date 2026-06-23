package com.buyora.backend.inventory.repository;

import com.buyora.backend.inventory.entity.StockNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockNotificationRepository extends JpaRepository<StockNotification, Long> {

    Page<StockNotification> findByVendorIdOrderByCreatedAtDesc(Long vendorId, Pageable pageable);

    long countByVendorIdAndReadFalse(Long vendorId);

    boolean existsByProductIdAndThresholdAndReadFalse(Long productId, Integer threshold);
}
