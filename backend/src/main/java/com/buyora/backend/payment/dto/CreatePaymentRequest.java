package com.buyora.backend.payment.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;
}
