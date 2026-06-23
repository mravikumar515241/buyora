package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcement_bars")
@Getter
@Setter
public class AnnouncementBar extends BaseEntity {

    @Column(nullable = false)
    private String text;

    private String link;

    private String backgroundColor = "#4f46e5";
    private String textColor = "#ffffff";

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(nullable = false)
    private boolean active = true;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
