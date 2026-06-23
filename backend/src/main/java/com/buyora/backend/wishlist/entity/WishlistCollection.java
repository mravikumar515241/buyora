package com.buyora.backend.wishlist.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "wishlist_collections")
@Getter
@Setter
public class WishlistCollection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private boolean defaultList;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WishlistVisibility visibility = WishlistVisibility.PRIVATE;

    @Column(unique = true, length = 64)
    private String shareToken;

    @PrePersist
    void ensureShareToken() {
        if (shareToken == null || shareToken.isBlank()) {
            shareToken = UUID.randomUUID().toString().replace("-", "");
        }
    }
}
