package com.buyora.backend.review.repository;

import com.buyora.backend.review.entity.ReviewHelpfulVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewHelpfulVoteRepository extends JpaRepository<ReviewHelpfulVote, Long> {

    Optional<ReviewHelpfulVote> findByUserIdAndReviewId(Long userId, Long reviewId);

    void deleteByReviewId(Long reviewId);
}
