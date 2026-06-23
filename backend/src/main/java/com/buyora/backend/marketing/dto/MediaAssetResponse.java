package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MediaAssetResponse {
    private Long id;
    private String name;
    private String url;
    private String mediaType;
    private Long uploadedByUserId;
    private LocalDateTime createdAt;
}
