package com.buyora.backend.order.dto;

import com.buyora.backend.order.entity.Order;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Order.OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String couponCode;
    private String shippingAddress;
    private String phone;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private Long userId;
    private String userEmail;
}
