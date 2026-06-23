package com.buyora.backend.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreatePaymentResponse {
    private String razorpayOrderId;
    private String amount;
    private String currency;
    private String keyId;
}
