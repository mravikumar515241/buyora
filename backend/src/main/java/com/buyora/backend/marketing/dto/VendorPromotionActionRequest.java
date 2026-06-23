package com.buyora.backend.marketing.dto;

import com.buyora.backend.marketing.entity.VendorPromotionRequest;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorPromotionActionRequest {
    private VendorPromotionRequest.RequestStatus status;
    private String adminNotes;
}
