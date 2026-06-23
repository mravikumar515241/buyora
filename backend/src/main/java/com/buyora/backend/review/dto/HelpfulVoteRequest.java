package com.buyora.backend.review.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HelpfulVoteRequest {
    private Boolean helpful;
}
