package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private String performedByEmail;
    private String details;
    private LocalDateTime createdAt;
}
