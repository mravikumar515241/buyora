package com.buyora.backend.wishlist.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.wishlist.dto.*;
import com.buyora.backend.wishlist.service.SavedItemService;
import com.buyora.backend.wishlist.service.WishlistCollectionService;
import com.buyora.backend.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final WishlistCollectionService collectionService;
    private final SavedItemService savedItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long collectionId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        WishlistResponse response = collectionId != null
                ? wishlistService.getWishlist(principal.getUserId(), collectionId, search, pageable)
                : wishlistService.getAllWishlistItems(principal.getUserId(), search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/lists")
    public ResponseEntity<ApiResponse<List<WishlistCollectionResponse>>> listCollections(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(collectionService.listCollections(principal.getUserId())));
    }

    @PostMapping("/lists")
    public ResponseEntity<ApiResponse<WishlistCollectionResponse>> createCollection(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody WishlistCollectionRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success("Wishlist created",
                collectionService.createCollection(principal.getUserId(), request)));
    }

    @PutMapping("/lists/{id}")
    public ResponseEntity<ApiResponse<WishlistCollectionResponse>> updateCollection(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody WishlistCollectionRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success("Wishlist updated",
                collectionService.updateCollection(principal.getUserId(), id, request)));
    }

    @DeleteMapping("/lists/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCollection(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        collectionService.deleteCollection(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("Wishlist deleted", null));
    }

    @PostMapping("/lists/{id}/share")
    public ResponseEntity<ApiResponse<Map<String, String>>> regenerateShareLink(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        String token = collectionService.regenerateShareLink(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("shareToken", token)));
    }

    @GetMapping("/shared/{shareToken}/items")
    public ResponseEntity<ApiResponse<WishlistResponse>> getSharedItems(
            @PathVariable String shareToken,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getSharedWishlist(shareToken, pageable)));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", wishlistService.getWishlistCount(principal.getUserId()))));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> getRecent(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "5") int limit) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getRecent(principal.getUserId(), limit)));
    }

    @GetMapping("/products/{productId}/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("wishlisted", false)));
        }
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "wishlisted", wishlistService.isWishlisted(principal.getUserId(), productId))));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> add(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long productId,
            @RequestParam(required = false) Long collectionId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist",
                wishlistService.addToWishlist(principal.getUserId(), productId, collectionId)));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        wishlistService.removeFromWishlist(principal.getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<WishlistToggleResponse>> toggle(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestParam(required = false) Long collectionId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(
                wishlistService.toggleWishlist(principal.getUserId(), productId, collectionId)));
    }

    @PostMapping("/items/{productId}/move")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> moveItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestParam Long targetCollectionId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success("Item moved",
                wishlistService.moveToCollection(principal.getUserId(), productId, targetCollectionId)));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<SavedItemResponse>>> getSaved(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(savedItemService.getSavedItems(principal.getUserId())));
    }

    @PostMapping("/save-for-later/{productId}")
    public ResponseEntity<ApiResponse<SavedItemResponse>> saveForLater(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success("Saved for later",
                savedItemService.saveForLater(principal.getUserId(), productId)));
    }

    @DeleteMapping("/saved/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeSaved(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        savedItemService.remove(principal.getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed saved item", null));
    }

    @PostMapping("/saved/{productId}/move-to-cart")
    public ResponseEntity<ApiResponse<Void>> moveSavedToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        savedItemService.moveToCart(principal.getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Moved to cart", null));
    }

    @GetMapping("/vendor/stats")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<List<VendorWishlistStatResponse>>> vendorStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getVendorWishlistStats(principal.getUserId())));
    }
}
