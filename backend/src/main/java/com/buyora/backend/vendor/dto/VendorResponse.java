package com.buyora.backend.vendor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorResponse {
    private Long id;
    private Long userId;
    private String businessName;
    private String phone;
    private String address;
    private String gstNumber;
    private boolean approved;
}
