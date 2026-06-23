package com.buyora.backend.inventory.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.vendor.entity.Vendor;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "stock_notifications")
@Getter
@Setter
public class StockNotification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer threshold;

    @Column(nullable = false)
    private Integer availableQuantity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean read = false;
}
