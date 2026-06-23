package com.buyora.backend.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KeywordCountItem {
    private String keyword;
    private Long count;
}
