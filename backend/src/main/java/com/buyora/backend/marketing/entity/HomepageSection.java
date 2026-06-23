package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "homepage_sections", uniqueConstraints = @UniqueConstraint(columnNames = "section_key"))
@Getter
@Setter
public class HomepageSection extends BaseEntity {

    @Column(name = "section_key", nullable = false, unique = true)
    private String sectionKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false)
    private HomepageSectionType sectionType;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private boolean visible = true;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    private Integer displayLimit = 12;

    private String subtitle;

    /** @deprecated use configJson productIds — kept for migration */
    @Column(length = 2000)
    private String productIds;

    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;
}
