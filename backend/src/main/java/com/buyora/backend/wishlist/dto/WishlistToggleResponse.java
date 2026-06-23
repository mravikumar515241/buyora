package com.buyora.backend.wishlist.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WishlistToggleResponse {
    private boolean wishlisted;
    private long wishlistCount;
}
