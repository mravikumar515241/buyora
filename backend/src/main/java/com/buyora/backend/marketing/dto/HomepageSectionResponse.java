package com.buyora.backend.marketing.dto;

import com.buyora.backend.marketing.entity.HomepageSectionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HomepageSectionResponse {
    private Long id;
    private String sectionKey;
    private HomepageSectionType sectionType;
    private String label;
    private boolean visible;
    private Integer sortOrder;
    private Integer displayLimit;
    private String subtitle;
    private String productIds;
    private String configJson;
}
