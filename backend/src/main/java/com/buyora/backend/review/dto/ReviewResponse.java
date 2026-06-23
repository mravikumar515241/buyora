package com.buyora.backend.review.dto;

import com.buyora.backend.review.entity.ReviewModerationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long productId;
    private String productName;
    private Integer rating;
    private String title;
    private String comment;
    private List<String> imageUrls;
    private Boolean verifiedPurchase;
    private Long orderId;
    private ReviewModerationStatus moderationStatus;
    private String moderationReason;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private Boolean userMarkedHelpful;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
