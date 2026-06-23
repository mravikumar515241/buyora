package com.buyora.backend.vendor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VendorRequest {
    @NotBlank(message = "Business name is required")
    private String businessName;
    private String phone;
    private String address;
    private String gstNumber;
}
