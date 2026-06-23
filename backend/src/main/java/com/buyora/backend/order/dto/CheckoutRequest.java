package com.buyora.backend.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
    @NotBlank(message = "Phone is required")
    private String phone;
    private String couponCode;
}
