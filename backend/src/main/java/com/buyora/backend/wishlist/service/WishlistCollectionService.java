package com.buyora.backend.wishlist.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.wishlist.dto.WishlistCollectionRequest;
import com.buyora.backend.wishlist.dto.WishlistCollectionResponse;
import com.buyora.backend.wishlist.entity.WishlistCollection;
import com.buyora.backend.wishlist.entity.WishlistVisibility;
import com.buyora.backend.wishlist.repository.WishlistCollectionRepository;
import com.buyora.backend.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WishlistCollectionService {

    private final WishlistCollectionRepository collectionRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WishlistCollectionResponse> listCollections(Long userId) {
        return collectionRepository.findByUserIdOrderByDefaultListDescCreatedAtAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WishlistCollectionResponse getCollection(Long userId, Long collectionId) {
        WishlistCollection collection = getOwnedCollection(userId, collectionId);
        return toResponse(collection);
    }

    @Transactional(readOnly = true)
    public WishlistCollectionResponse getSharedCollection(String shareToken) {
        return toResponse(getSharedCollectionEntity(shareToken));
    }

    @Transactional(readOnly = true)
    public WishlistCollection getSharedCollectionEntity(String shareToken) {
        WishlistCollection collection = collectionRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "shareToken", shareToken));
        if (collection.getVisibility() == WishlistVisibility.PRIVATE) {
            throw new IllegalArgumentException("This wishlist is private");
        }
        return collection;
    }

    @Transactional
    public WishlistCollectionResponse createCollection(Long userId, WishlistCollectionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        WishlistCollection collection = new WishlistCollection();
        collection.setUser(user);
        collection.setName(request.getName() != null && !request.getName().isBlank()
                ? request.getName().trim() : "My Wishlist");
        collection.setDefaultList(false);
        collection.setVisibility(request.getVisibility() != null ? request.getVisibility() : WishlistVisibility.PRIVATE);
        return toResponse(collectionRepository.save(collection));
    }

    @Transactional
    public WishlistCollectionResponse updateCollection(Long userId, Long collectionId, WishlistCollectionRequest request) {
        WishlistCollection collection = getOwnedCollection(userId, collectionId);
        if (request.getName() != null && !request.getName().isBlank()) {
            collection.setName(request.getName().trim());
        }
        if (request.getVisibility() != null) {
            collection.setVisibility(request.getVisibility());
        }
        return toResponse(collectionRepository.save(collection));
    }

    @Transactional
    public void deleteCollection(Long userId, Long collectionId) {
        WishlistCollection collection = getOwnedCollection(userId, collectionId);
        if (collection.isDefaultList()) {
            throw new IllegalArgumentException("Cannot delete your default wishlist");
        }
        collectionRepository.delete(collection);
    }

    @Transactional
    public String regenerateShareLink(Long userId, Long collectionId) {
        WishlistCollection collection = getOwnedCollection(userId, collectionId);
        collection.setShareToken(UUID.randomUUID().toString().replace("-", ""));
        collectionRepository.save(collection);
        return collection.getShareToken();
    }

    @Transactional
    public WishlistCollection ensureDefaultCollection(Long userId) {
        return collectionRepository.findByUserIdAndDefaultListTrue(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    WishlistCollection collection = new WishlistCollection();
                    collection.setUser(user);
                    collection.setName("My Wishlist");
                    collection.setDefaultList(true);
                    collection.setVisibility(WishlistVisibility.PRIVATE);
                    return collectionRepository.save(collection);
                });
    }

    public WishlistCollection getOwnedCollection(Long userId, Long collectionId) {
        return collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "id", collectionId));
    }

    @Transactional
    public WishlistCollection resolveCollection(Long userId, Long collectionId) {
        if (collectionId != null) {
            return getOwnedCollection(userId, collectionId);
        }
        return ensureDefaultCollection(userId);
    }

    @Transactional(readOnly = true)
    public long countAllCollections() {
        return collectionRepository.count();
    }

    private WishlistCollectionResponse toResponse(WishlistCollection collection) {
        return WishlistCollectionResponse.builder()
                .id(collection.getId())
                .name(collection.getName())
                .defaultList(collection.isDefaultList())
                .visibility(collection.getVisibility())
                .shareToken(collection.getShareToken())
                .itemCount(wishlistRepository.countByCollectionId(collection.getId()))
                .createdAt(collection.getCreatedAt())
                .build();
    }
}
