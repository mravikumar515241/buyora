package com.buyora.backend.config;

import com.buyora.backend.coupon.entity.Coupon;
import com.buyora.backend.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@Order(4)
@RequiredArgsConstructor
public class CouponSeeder implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) {
        seed("WELCOME10", Coupon.DiscountType.PERCENTAGE, 10, new BigDecimal("200"), new BigDecimal("299"), 1000);
        seed("BUYORA100", Coupon.DiscountType.FIXED_AMOUNT, 100, null, new BigDecimal("799"), 500);
        seed("BUYORA500", Coupon.DiscountType.FIXED_AMOUNT, 500, null, new BigDecimal("2499"), 200);
        seed("SUMMER2026", Coupon.DiscountType.PERCENTAGE, 15, new BigDecimal("750"), new BigDecimal("999"), 300);
        seed("FESTIVAL50", Coupon.DiscountType.PERCENTAGE, 50, new BigDecimal("1000"), new BigDecimal("1499"), 150);
        seed("FLASH20", Coupon.DiscountType.PERCENTAGE, 20, new BigDecimal("400"), new BigDecimal("499"), 500);
    }

    private void seed(String code, Coupon.DiscountType type, double value,
                      BigDecimal maxDiscount, BigDecimal minOrder, int maxUses) {
        if (couponRepository.existsByCode(code)) {
            return;
        }
        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setDiscountType(type);
        coupon.setDiscountValue(BigDecimal.valueOf(value));
        coupon.setMaxDiscountAmount(maxDiscount);
        coupon.setMinOrderAmount(minOrder);
        coupon.setMaxUses(maxUses);
        coupon.setUsedCount(0);
        coupon.setValidFrom(LocalDateTime.now().minusDays(1));
        coupon.setValidTo(LocalDateTime.now().plusMonths(6));
        coupon.setActive(true);
        couponRepository.save(coupon);
    }
}
