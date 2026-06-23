package com.buyora.backend.wishlist.dto;

import com.buyora.backend.wishlist.entity.WishlistVisibility;
import lombok.Data;

@Data
public class WishlistCollectionRequest {
    private String name;
    private WishlistVisibility visibility;
}
