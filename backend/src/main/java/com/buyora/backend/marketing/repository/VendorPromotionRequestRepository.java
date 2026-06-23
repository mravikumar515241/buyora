package com.buyora.backend.marketing.repository;

import com.buyora.backend.marketing.entity.VendorPromotionRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorPromotionRequestRepository extends JpaRepository<VendorPromotionRequest, Long> {
    List<VendorPromotionRequest> findByStatusOrderByCreatedAtDesc(VendorPromotionRequest.RequestStatus status);
    long countByStatus(VendorPromotionRequest.RequestStatus status);
}
