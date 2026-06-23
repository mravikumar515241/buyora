package com.buyora.backend.vendor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VendorProfileResponse {
    private Long id;
    private String businessName;
    private Double averageRating;
    private Double averageDeliveryRating;
    private Double customerSatisfactionScore;
    private Double vendorRating;
    private long productCount;
    private long reviewCount;
    private long totalSales;
    private LocalDateTime memberSince;
    private List<String> badges;
}
