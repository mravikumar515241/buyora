package com.buyora.backend.review.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RatingBreakdownItem {
    private int stars;
    private long count;
    private int percentage;
}
