package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "flash_sale_items")
@Getter
@Setter
public class FlashSaleItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flash_sale_id", nullable = false)
    private FlashSale flashSale;

    @Column(nullable = false)
    private Long productId;

    private Long categoryId;

    private Integer allocatedStock;

    private Integer saleLimit;
}
