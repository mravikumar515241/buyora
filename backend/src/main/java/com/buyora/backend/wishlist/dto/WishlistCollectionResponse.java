package com.buyora.backend.wishlist.dto;

import com.buyora.backend.wishlist.entity.WishlistVisibility;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WishlistCollectionResponse {
    private Long id;
    private String name;
    private boolean defaultList;
    private WishlistVisibility visibility;
    private String shareToken;
    private long itemCount;
    private LocalDateTime createdAt;
}
