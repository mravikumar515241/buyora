package com.buyora.backend.product.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.inventory.StockStatus;
import com.buyora.backend.vendor.entity.Vendor;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private Integer stock;

    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    @Column(nullable = false)
    private Integer soldQuantity = 0;

    @Column(length = 64)
    private String sku;

    @Column(nullable = false)
    private Integer lowStockThreshold = 10;

    @Column(nullable = false)
    private Integer reorderThreshold = 5;

    @Enumerated(EnumType.STRING)
    private StockStatus stockStatusOverride;

    private LocalDate expectedRestockDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.PENDING_APPROVAL;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false)
    private Long viewCount = 0L;

    @Column(columnDefinition = "TEXT")
    private String adminComments;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    public enum ProductStatus {
        PENDING_APPROVAL,
        MODIFICATION_REQUESTED,
        APPROVED,
        REJECTED
    }
}
