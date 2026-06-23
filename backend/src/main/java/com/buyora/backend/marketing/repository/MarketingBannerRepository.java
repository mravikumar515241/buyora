package com.buyora.backend.marketing.repository;

import com.buyora.backend.marketing.entity.MarketingBanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketingBannerRepository extends JpaRepository<MarketingBanner, Long> {
    List<MarketingBanner> findByDisplayLocationOrderByPriorityAsc(MarketingBanner.DisplayLocation location);
    List<MarketingBanner> findAllByOrderByPriorityAsc();
    long countByActiveTrue();
}
