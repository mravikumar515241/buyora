package com.buyora.backend.wishlist.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class WishlistResponse {
    private List<WishlistItemResponse> items;
    private long totalCount;
}
