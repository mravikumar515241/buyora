package com.buyora.backend.discovery.dto;

import com.buyora.backend.product.dto.ProductResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SearchSuggestionResponse {
    private List<String> suggestions;
    private List<ProductResponse> products;
}
