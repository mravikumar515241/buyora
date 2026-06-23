package com.buyora.backend.review.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Getter
@Setter
public class Review extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", length = 2000)
    private String comment;

    @Column
    private Long orderId;

    @Column
    private Long orderItemId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewModerationStatus moderationStatus = ReviewModerationStatus.VISIBLE;

    @Column(columnDefinition = "TEXT")
    private String moderationReason;

    @Column(nullable = false)
    private Integer helpfulCount = 0;

    @Column(nullable = false)
    private Integer notHelpfulCount = 0;
}
