package com.buyora.backend.marketing.dto;

import com.buyora.backend.coupon.dto.CouponResponse;
import com.buyora.backend.discovery.dto.VendorFilterOption;
import com.buyora.backend.product.dto.CategoryResponse;
import com.buyora.backend.product.dto.ProductResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HomepageSectionContent {
    private List<BannerResponse> banners;
    private List<ProductResponse> products;
    private List<CategoryResponse> categories;
    private List<CouponResponse> coupons;
    private List<VendorFilterOption> vendors;
    private FlashSaleResponse flashSale;
    private String viewAllLink;
}
