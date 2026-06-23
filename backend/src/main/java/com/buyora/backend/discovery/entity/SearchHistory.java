package com.buyora.backend.discovery.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "search_history", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "keyword"}))
@Getter
@Setter
public class SearchHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String keyword;
}
