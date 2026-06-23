package com.buyora.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RestockSubscriptionResponse {
    private boolean subscribed;
}
