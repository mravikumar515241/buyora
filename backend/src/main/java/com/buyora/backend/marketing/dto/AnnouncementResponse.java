package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AnnouncementResponse {
    private Long id;
    private String text;
    private String link;
    private String backgroundColor;
    private String textColor;
    private Integer priority;
    private boolean active;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
}
