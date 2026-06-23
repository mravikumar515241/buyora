package com.buyora.backend.review.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ReviewRequest {

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String comment;

    @Size(max = 5)
    private List<@NotBlank @Size(max = 500) String> imageUrls = new ArrayList<>();
}
