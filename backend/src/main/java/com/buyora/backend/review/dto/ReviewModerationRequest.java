package com.buyora.backend.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewModerationRequest {

    @NotBlank
    @Size(max = 500)
    private String reason;
}
