package com.buyora.backend.marketing.repository;

import com.buyora.backend.marketing.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {
    List<FlashSale> findByActiveTrueAndEndTimeAfterOrderByStartTimeAsc(LocalDateTime now);
}
