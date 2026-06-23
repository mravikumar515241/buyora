package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MediaAssetRequest {
    private String name;
    private String url;
    private String mediaType;
}
