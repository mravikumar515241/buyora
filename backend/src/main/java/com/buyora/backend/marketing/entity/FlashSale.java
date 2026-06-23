package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flash_sales")
@Getter
@Setter
public class FlashSale extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private boolean active = true;

    private BigDecimal discountPercent = BigDecimal.valueOf(20);

    private Integer stockAllocationLimit;

    @OneToMany(mappedBy = "flashSale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlashSaleItem> items = new ArrayList<>();
}
