package com.buyora.backend.discovery.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_views", indexes = {
        @Index(name = "idx_product_views_user", columnList = "user_id, created_at"),
        @Index(name = "idx_product_views_product", columnList = "product_id"),
        @Index(name = "idx_product_views_session", columnList = "session_id, created_at")
})
@Getter
@Setter
public class ProductView extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(length = 100)
    private String sessionId;
}
