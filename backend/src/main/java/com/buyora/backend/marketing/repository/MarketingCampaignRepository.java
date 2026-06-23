package com.buyora.backend.marketing.repository;

import com.buyora.backend.marketing.entity.MarketingCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, Long> {
    List<MarketingCampaign> findByStatus(MarketingCampaign.CampaignStatus status);
    long countByStatus(MarketingCampaign.CampaignStatus status);
}
