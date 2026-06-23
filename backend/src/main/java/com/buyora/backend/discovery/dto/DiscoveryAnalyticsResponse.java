package com.buyora.backend.discovery.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DiscoveryAnalyticsResponse {
    private List<KeywordCountItem> mostSearchedKeywords;
    private List<KeywordCountItem> searchesWithNoResults;
    private List<KeywordCountItem> topConvertingSearches;
    private List<ViewedProductItem> mostViewedProducts;
}
