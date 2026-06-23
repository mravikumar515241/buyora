package com.buyora.backend.review.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "review_helpful_votes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "review_id"}))
@Getter
@Setter
public class ReviewHelpfulVote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Column(nullable = false)
    private Boolean helpful;
}
