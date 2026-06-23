package com.buyora.backend.marketing.dto;

import com.buyora.backend.marketing.entity.HomepageSectionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HomepageSectionView {
    private Long id;
    private String sectionKey;
    private HomepageSectionType sectionType;
    private String title;
    private String subtitle;
    private Integer displayLimit;
    private Integer sortOrder;
    private HomepageSectionContent content;
}
