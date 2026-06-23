package com.buyora.backend.admin.dto;

import lombok.Data;

@Data
public class VendorApprovalRequest {
    private boolean approved;
    private String reason;
}
