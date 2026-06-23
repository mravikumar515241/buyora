package com.buyora.backend.marketing.service;

import com.buyora.backend.coupon.dto.CouponResponse;
import com.buyora.backend.coupon.entity.Coupon;
import com.buyora.backend.coupon.repository.CouponRepository;
import com.buyora.backend.discovery.dto.VendorFilterOption;
import com.buyora.backend.discovery.service.DiscoveryService;
import com.buyora.backend.marketing.dto.*;
import com.buyora.backend.marketing.entity.*;
import com.buyora.backend.marketing.repository.*;
import com.buyora.backend.product.dto.CategoryResponse;
import com.buyora.backend.product.dto.ProductResponse;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.product.service.CategoryService;
import com.buyora.backend.product.service.ProductService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HomepageContentResolver {

    private final HomepageSectionRepository sectionRepository;
    private final MarketingBannerRepository bannerRepository;
    private final FlashSaleRepository flashSaleRepository;
    private final AnnouncementBarRepository announcementRepository;
    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final DiscoveryService discoveryService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public HomepageContentResponse resolve(String sessionId) {
        LocalDateTime now = LocalDateTime.now();
        List<HomepageSectionView> sections = sectionRepository.findAllByOrderBySortOrderAsc().stream()
                .filter(HomepageSection::isVisible)
                .map(section -> resolveSection(section, now, sessionId))
                .filter(view -> view.getContent() != null)
                .collect(Collectors.toList());

        return HomepageContentResponse.builder()
                .announcements(filterActiveAnnouncements(now))
                .sections(sections)
                .build();
    }

    private HomepageSectionView resolveSection(HomepageSection section, LocalDateTime now, String sessionId) {
        HomepageSectionType type = section.getSectionType() != null
                ? section.getSectionType()
                : inferSectionType(section.getSectionKey());
        Map<String, Object> config = parseConfig(section);
        int limit = section.getDisplayLimit() != null ? section.getDisplayLimit() : 12;
        HomepageSectionContent content = switch (type) {
            case HERO_CAROUSEL, BANNER_GRID -> resolveBannerContent(section, config, now);
            case FLASH_SALE -> resolveFlashSaleContent(now, limit);
            case PRODUCT_CAROUSEL -> resolveProductContent(section, config, limit, sessionId);
            case CATEGORY_LIST -> resolveCategoryContent(limit, config);
            case COUPON_LIST -> resolveCouponContent(limit);
            case VENDOR_SPOTLIGHT -> resolveVendorContent(limit, config);
        };

        return HomepageSectionView.builder()
                .id(section.getId())
                .sectionKey(section.getSectionKey())
                .sectionType(type)
                .title(section.getLabel())
                .subtitle(section.getSubtitle())
                .displayLimit(limit)
                .sortOrder(section.getSortOrder())
                .content(content)
                .build();
    }

    private HomepageSectionContent resolveBannerContent(HomepageSection section, Map<String, Object> config, LocalDateTime now) {
        String locationName = stringVal(config, "bannerLocation");
        if (locationName == null) {
            locationName = section.getSectionType() == HomepageSectionType.HERO_CAROUSEL ? "HERO" : "DEALS_GRID";
        }
        MarketingBanner.DisplayLocation location;
        try {
            location = MarketingBanner.DisplayLocation.valueOf(locationName);
        } catch (IllegalArgumentException e) {
            location = MarketingBanner.DisplayLocation.HERO;
        }
        List<BannerResponse> banners = bannerRepository.findByDisplayLocationOrderByPriorityAsc(location).stream()
                .filter(b -> b.isActive() && isWithinSchedule(b.getStartDate(), b.getEndDate(), now))
                .map(this::toBannerResponse)
                .collect(Collectors.toList());
        if (banners.isEmpty()) return null;
        return HomepageSectionContent.builder()
                .banners(banners)
                .viewAllLink(stringVal(config, "viewAllLink"))
                .build();
    }

    private HomepageSectionContent resolveFlashSaleContent(LocalDateTime now, int limit) {
        Optional<FlashSale> saleOpt = flashSaleRepository.findByActiveTrueAndEndTimeAfterOrderByStartTimeAsc(now).stream()
                .filter(s -> !s.getStartTime().isAfter(now))
                .findFirst();
        if (saleOpt.isEmpty()) return null;

        FlashSale sale = saleOpt.get();
        FlashSaleResponse flashSale = toFlashSaleResponse(sale);
        List<Long> productIds = sale.getItems() == null ? List.of() : sale.getItems().stream()
                .map(FlashSaleItem::getProductId)
                .filter(Objects::nonNull)
                .limit(limit)
                .toList();

        List<ProductResponse> products = loadProductsByIds(productIds);
        return HomepageSectionContent.builder()
                .flashSale(flashSale)
                .products(products)
                .build();
    }

    private HomepageSectionContent resolveProductContent(HomepageSection section, Map<String, Object> config,
                                                           int limit, String sessionId) {
        String source = stringVal(config, "source");
        if (source == null) {
            source = inferProductSource(section.getSectionKey());
        }

        List<ProductResponse> products;
        if ("curated".equalsIgnoreCase(source)) {
            String ids = stringVal(config, "productIds");
            if (ids == null && section.getProductIds() != null) {
                ids = section.getProductIds();
            }
            products = loadProductsByIds(parseIds(ids)).stream().limit(limit).toList();
        } else {
            products = switch (source.toLowerCase()) {
                case "trending", "popular" -> discoveryService.getPopularProducts(limit);
                case "best_selling", "bestsellers" -> discoveryService.search(null, List.of(), null, null, null, null, null,
                        "best_selling", PageRequest.of(0, limit)).getContent();
                case "newest", "new_arrivals" -> discoveryService.search(null, List.of(), null, null, null, null, null,
                        "newest", PageRequest.of(0, limit)).getContent();
                case "rating", "top_rated" -> discoveryService.search(null, List.of(), null, null, null, null, null,
                        "rating", PageRequest.of(0, limit)).getContent();
                case "most_wishlisted" -> discoveryService.search(null, List.of(), null, null, null, null, null,
                        "most_wishlisted", PageRequest.of(0, limit)).getContent();
                case "recently_viewed" -> sessionId != null && !sessionId.isBlank()
                        ? discoveryService.getRecentlyViewed(null, sessionId, limit)
                        : List.of();
                case "recommended" -> discoveryService.search(null, List.of(), null, null, null, null, null,
                        "rating", PageRequest.of(0, limit)).getContent();
                case "featured" -> discoveryService.getPopularProducts(limit);
                default -> discoveryService.getPopularProducts(limit);
            };
        }

        if (products.isEmpty()) return null;
        return HomepageSectionContent.builder()
                .products(products)
                .viewAllLink(stringVal(config, "viewAllLink"))
                .build();
    }

    private HomepageSectionContent resolveCategoryContent(int limit, Map<String, Object> config) {
        List<CategoryResponse> categories = categoryService.findAll().stream().limit(limit).toList();
        if (categories.isEmpty()) return null;
        return HomepageSectionContent.builder()
                .categories(categories)
                .viewAllLink(stringVal(config, "viewAllLink"))
                .build();
    }

    private HomepageSectionContent resolveCouponContent(int limit) {
        List<CouponResponse> coupons = couponRepository.findByActiveTrue(PageRequest.of(0, limit)).stream()
                .filter(this::isCouponValid)
                .map(this::toCouponResponse)
                .collect(Collectors.toList());
        if (coupons.isEmpty()) return null;
        return HomepageSectionContent.builder()
                .coupons(coupons)
                .viewAllLink("/offers")
                .build();
    }

    private HomepageSectionContent resolveVendorContent(int limit, Map<String, Object> config) {
        int vendorLimit = config.get("limit") != null ? ((Number) config.get("limit")).intValue() : limit;
        List<VendorFilterOption> vendors = discoveryService.getVendorFilterOptions().stream()
                .limit(vendorLimit)
                .toList();
        if (vendors.isEmpty()) return null;
        return HomepageSectionContent.builder()
                .vendors(vendors)
                .viewAllLink(stringVal(config, "viewAllLink"))
                .build();
    }

    private List<ProductResponse> loadProductsByIds(List<Long> ids) {
        if (ids.isEmpty()) return List.of();
        Map<Long, ProductResponse> map = productRepository.findAllById(ids).stream()
                .filter(p -> p.getStatus() == Product.ProductStatus.APPROVED)
                .map(productService::toPublicResponse)
                .collect(Collectors.toMap(ProductResponse::getId, p -> p, (a, b) -> a, LinkedHashMap::new));
        return ids.stream().map(map::get).filter(Objects::nonNull).toList();
    }

    private List<Long> parseIds(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        List<Long> ids = new ArrayList<>();
        for (String part : raw.split("[,\\s]+")) {
            if (part.isBlank()) continue;
            try {
                ids.add(Long.parseLong(part.trim()));
            } catch (NumberFormatException ignored) {
                // skip invalid ids
            }
        }
        return ids;
    }

    private String inferProductSource(String sectionKey) {
        return switch (sectionKey) {
            case "trending" -> "trending";
            case "best_sellers" -> "best_selling";
            case "new_arrivals" -> "newest";
            case "top_rated" -> "rating";
            case "most_wishlisted" -> "most_wishlisted";
            case "recently_viewed" -> "recently_viewed";
            case "recommended" -> "recommended";
            case "featured_products" -> "featured";
            default -> "trending";
        };
    }

    private HomepageSectionType inferSectionType(String sectionKey) {
        return switch (sectionKey) {
            case "hero_carousel" -> HomepageSectionType.HERO_CAROUSEL;
            case "flash_sale" -> HomepageSectionType.FLASH_SALE;
            case "deals_grid", "category_offers" -> HomepageSectionType.BANNER_GRID;
            case "coupons" -> HomepageSectionType.COUPON_LIST;
            case "popular_categories" -> HomepageSectionType.CATEGORY_LIST;
            case "vendor_spotlight" -> HomepageSectionType.VENDOR_SPOTLIGHT;
            default -> HomepageSectionType.PRODUCT_CAROUSEL;
        };
    }

    private Map<String, Object> parseConfig(HomepageSection section) {
        if (section.getConfigJson() == null || section.getConfigJson().isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(section.getConfigJson(), new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Invalid config JSON for section {}: {}", section.getSectionKey(), e.getMessage());
            return new HashMap<>();
        }
    }

    private String stringVal(Map<String, Object> config, String key) {
        Object val = config.get(key);
        return val != null ? val.toString() : null;
    }

    private boolean isWithinSchedule(LocalDateTime start, LocalDateTime end, LocalDateTime now) {
        if (start != null && now.isBefore(start)) return false;
        if (end != null && now.isAfter(end)) return false;
        return true;
    }

    private boolean isCouponValid(Coupon coupon) {
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) return false;
        if (coupon.getValidTo() != null && now.isAfter(coupon.getValidTo())) return false;
        if (coupon.getMaxUses() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            return false;
        }
        return true;
    }

    private List<AnnouncementResponse> filterActiveAnnouncements(LocalDateTime now) {
        return announcementRepository.findByActiveTrueOrderByPriorityAsc().stream()
                .filter(a -> isWithinSchedule(a.getStartTime(), a.getEndTime(), now))
                .map(this::toAnnouncementResponse)
                .collect(Collectors.toList());
    }

    private BannerResponse toBannerResponse(MarketingBanner b) {
        return BannerResponse.builder()
                .id(b.getId()).title(b.getTitle()).subtitle(b.getSubtitle()).description(b.getDescription())
                .imageUrl(b.getImageUrl()).mobileImageUrl(b.getMobileImageUrl()).gradient(b.getGradient())
                .buttonText(b.getButtonText()).buttonLink(b.getButtonLink()).badge(b.getBadge())
                .startDate(b.getStartDate()).endDate(b.getEndDate()).priority(b.getPriority())
                .active(b.isActive()).displayLocation(b.getDisplayLocation())
                .createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt())
                .build();
    }

    private FlashSaleResponse toFlashSaleResponse(FlashSale s) {
        List<FlashSaleItemResponse> items = s.getItems() == null ? List.of() : s.getItems().stream()
                .map(i -> FlashSaleItemResponse.builder()
                        .id(i.getId()).productId(i.getProductId()).categoryId(i.getCategoryId())
                        .allocatedStock(i.getAllocatedStock()).saleLimit(i.getSaleLimit()).build())
                .collect(Collectors.toList());
        return FlashSaleResponse.builder()
                .id(s.getId()).title(s.getTitle()).description(s.getDescription())
                .startTime(s.getStartTime()).endTime(s.getEndTime()).active(s.isActive())
                .discountPercent(s.getDiscountPercent()).stockAllocationLimit(s.getStockAllocationLimit())
                .items(items).createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt())
                .build();
    }

    private CouponResponse toCouponResponse(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .discountType(c.getDiscountType())
                .discountValue(c.getDiscountValue())
                .minOrderAmount(c.getMinOrderAmount())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .maxUses(c.getMaxUses())
                .usedCount(c.getUsedCount())
                .validFrom(c.getValidFrom())
                .validTo(c.getValidTo())
                .active(c.isActive())
                .build();
    }

    private AnnouncementResponse toAnnouncementResponse(AnnouncementBar a) {
        return AnnouncementResponse.builder()
                .id(a.getId()).text(a.getText()).link(a.getLink())
                .backgroundColor(a.getBackgroundColor()).textColor(a.getTextColor())
                .priority(a.getPriority()).active(a.isActive())
                .startTime(a.getStartTime()).endTime(a.getEndTime()).createdAt(a.getCreatedAt())
                .build();
    }
}
