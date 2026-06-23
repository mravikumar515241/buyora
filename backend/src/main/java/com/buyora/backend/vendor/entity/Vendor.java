package com.buyora.backend.vendor.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vendors", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Getter
@Setter
public class Vendor extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String businessName;

    private String phone;
    private String address;
    private String gstNumber;
    private boolean approved;
}
