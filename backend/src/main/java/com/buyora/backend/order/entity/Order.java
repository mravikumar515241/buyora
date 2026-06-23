package com.buyora.backend.order.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.CREATED;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    private String couponCode;

    private String shippingAddress;
    private String phone;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public enum OrderStatus {
        CREATED, PAID, SHIPPED, DELIVERED, CANCELLED
    }
}
