package com.buyora.backend.marketing.repository;

import com.buyora.backend.marketing.entity.MarketingAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketingAuditLogRepository extends JpaRepository<MarketingAuditLog, Long> {
    Page<MarketingAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
