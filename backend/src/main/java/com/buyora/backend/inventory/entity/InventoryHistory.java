package com.buyora.backend.inventory.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "inventory_history")
@Getter
@Setter
public class InventoryHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChangeType changeType;

    @Column(nullable = false)
    private Integer previousStock;

    @Column(nullable = false)
    private Integer newStock;

    private Integer previousReserved;
    private Integer newReserved;

    @Column(nullable = false)
    private Integer quantityChanged;

    private Long changedByUserId;
    private String changedByName;

    private Long orderId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum ChangeType {
        MANUAL_UPDATE,
        PURCHASE,
        ORDER_PLACED,
        ORDER_CANCELLED,
        RETURN_RECEIVED,
        ADMIN_ADJUSTMENT,
        SYSTEM_ADJUSTMENT,
        STOCK_ADDED,
        STOCK_REDUCED,
        RESERVATION_CREATED,
        RESERVATION_RELEASED,
        MANUAL_ADJUSTMENT,
        BULK_UPDATE
    }
}
