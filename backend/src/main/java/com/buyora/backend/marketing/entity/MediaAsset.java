package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "media_assets")
@Getter
@Setter
public class MediaAsset extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType mediaType = MediaType.IMAGE;

    private Long uploadedByUserId;

    public enum MediaType {
        IMAGE, BANNER, LOGO, CAMPAIGN
    }
}
