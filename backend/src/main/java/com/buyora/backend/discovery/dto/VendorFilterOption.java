package com.buyora.backend.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorFilterOption {
    private Long id;
    private String businessName;
    private Double averageRating;
    private long productCount;
}
