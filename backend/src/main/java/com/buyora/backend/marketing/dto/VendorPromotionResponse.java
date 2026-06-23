package com.buyora.backend.marketing.dto;

import com.buyora.backend.marketing.entity.VendorPromotionRequest;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class VendorPromotionResponse {
    private Long id;
    private Long vendorId;
    private String title;
    private String description;
    private BigDecimal discountPercent;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private VendorPromotionRequest.RequestStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
}
