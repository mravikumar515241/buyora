package com.buyora.backend.config;

import com.buyora.backend.marketing.entity.*;
import com.buyora.backend.marketing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Order(5)
@RequiredArgsConstructor
public class MarketingSeeder implements CommandLineRunner {

    private final MarketingBannerRepository bannerRepository;
    private final HomepageSectionRepository sectionRepository;
    private final AnnouncementBarRepository announcementRepository;

    private record SectionDef(
            String key,
            HomepageSectionType type,
            String label,
            String subtitle,
            int order,
            int limit,
            String configJson
    ) {}

    private static final SectionDef[] DEFAULTS = {
            new SectionDef("hero_carousel", HomepageSectionType.HERO_CAROUSEL, "Hero Carousel", "Shop the latest deals", 0, 12,
                    "{\"bannerLocation\":\"HERO\"}"),
            new SectionDef("flash_sale", HomepageSectionType.FLASH_SALE, "Flash Sale", "Lightning deals — limited stock", 1, 8, "{}"),
            new SectionDef("deals_grid", HomepageSectionType.BANNER_GRID, "Deals For You", "Handpicked offers today", 2, 4,
                    "{\"bannerLocation\":\"DEALS_GRID\",\"viewAllLink\":\"/offers\"}"),
            new SectionDef("category_offers", HomepageSectionType.BANNER_GRID, "Category Offers", "Shop by category", 3, 4,
                    "{\"bannerLocation\":\"CATEGORY\",\"viewAllLink\":\"/offers\"}"),
            new SectionDef("coupons", HomepageSectionType.COUPON_LIST, "Coupons & Offers", "Save more with exclusive codes", 4, 3,
                    "{\"viewAllLink\":\"/offers\"}"),
            new SectionDef("popular_categories", HomepageSectionType.CATEGORY_LIST, "Popular Categories", "Browse top categories", 5, 12,
                    "{\"viewAllLink\":\"/search\"}"),
            new SectionDef("vendor_spotlight", HomepageSectionType.VENDOR_SPOTLIGHT, "Vendor Spotlight", "Trusted sellers on Buyora", 6, 8,
                    "{\"viewAllLink\":\"/search\"}"),
            new SectionDef("featured_products", HomepageSectionType.PRODUCT_CAROUSEL, "Featured Products", "Curated picks for you", 7, 12,
                    "{\"source\":\"featured\",\"viewAllLink\":\"/search?sort=best_selling\"}"),
            new SectionDef("trending", HomepageSectionType.PRODUCT_CAROUSEL, "Trending Products", "Hot picks right now", 8, 12,
                    "{\"source\":\"trending\",\"viewAllLink\":\"/search?sort=best_selling\"}"),
            new SectionDef("best_sellers", HomepageSectionType.PRODUCT_CAROUSEL, "Best Sellers", "Customer favorites", 9, 12,
                    "{\"source\":\"best_selling\",\"viewAllLink\":\"/search?sort=best_selling\"}"),
            new SectionDef("new_arrivals", HomepageSectionType.PRODUCT_CAROUSEL, "New Arrivals", "Fresh additions to our catalog", 10, 12,
                    "{\"source\":\"newest\",\"viewAllLink\":\"/search?sort=newest\"}"),
            new SectionDef("top_rated", HomepageSectionType.PRODUCT_CAROUSEL, "Top Rated Products", "Highest rated by shoppers", 11, 12,
                    "{\"source\":\"rating\",\"viewAllLink\":\"/search?sort=rating\"}"),
            new SectionDef("most_wishlisted", HomepageSectionType.PRODUCT_CAROUSEL, "Most Wishlisted", "Products everyone loves", 12, 12,
                    "{\"source\":\"most_wishlisted\",\"viewAllLink\":\"/search?sort=most_wishlisted\"}"),
            new SectionDef("recommended", HomepageSectionType.PRODUCT_CAROUSEL, "Recommended For You", "Personalized suggestions", 13, 12,
                    "{\"source\":\"recommended\",\"viewAllLink\":\"/search?sort=rating\"}"),
            new SectionDef("recently_viewed", HomepageSectionType.PRODUCT_CAROUSEL, "Recently Viewed", "Pick up where you left off", 14, 12,
                    "{\"source\":\"recently_viewed\"}"),
    };

    @Override
    public void run(String... args) {
        seedHomepageSections();
        migrateSectionMetadata();
        seedHeroBanners();
        seedCategoryBanners();
        seedAnnouncements();
    }

    private void seedHomepageSections() {
        for (SectionDef def : DEFAULTS) {
            if (sectionRepository.findBySectionKey(def.key()).isPresent()) continue;
            HomepageSection section = new HomepageSection();
            section.setSectionKey(def.key());
            section.setSectionType(def.type());
            section.setLabel(def.label());
            section.setSubtitle(def.subtitle());
            section.setSortOrder(def.order());
            section.setDisplayLimit(def.limit());
            section.setConfigJson(def.configJson());
            section.setVisible(true);
            sectionRepository.save(section);
        }
    }

    private void migrateSectionMetadata() {
        for (SectionDef def : DEFAULTS) {
            sectionRepository.findBySectionKey(def.key()).ifPresent(section -> {
                boolean changed = false;
                if (section.getSectionType() == null) {
                    section.setSectionType(def.type());
                    changed = true;
                }
                if (section.getConfigJson() == null || section.getConfigJson().isBlank()) {
                    section.setConfigJson(def.configJson());
                    changed = true;
                }
                if (section.getSubtitle() == null || section.getSubtitle().isBlank()) {
                    section.setSubtitle(def.subtitle());
                    changed = true;
                }
                if (changed) sectionRepository.save(section);
            });
        }
    }

    private void seedHeroBanners() {
        if (bannerRepository.count() > 0) return;
        createBanner("Mega Sale Week", "Up to 70% off on top brands", "Live Now",
                "Shop Deals", "/offers", "from-rose-600 via-orange-500 to-amber-500",
                MarketingBanner.DisplayLocation.HERO, 0);
        createBanner("Flash Friday", "Lightning deals ending soon", "Ends Tonight",
                "Grab Flash Deals", "/offers?type=flash", "from-violet-600 via-purple-600 to-indigo-700",
                MarketingBanner.DisplayLocation.HERO, 1);
        createBanner("Free Delivery", "On orders above ₹499", "Free Shipping",
                "Start Shopping", "/products", "from-emerald-600 via-teal-600 to-cyan-600",
                MarketingBanner.DisplayLocation.HERO, 2);
    }

    private void seedCategoryBanners() {
        if (bannerRepository.findByDisplayLocationOrderByPriorityAsc(MarketingBanner.DisplayLocation.CATEGORY).size() >= 4) return;
        createBanner("Electronics Sale", "Shop gadgets & devices", "Sale",
                "Shop Now", "/search?q=electronics", "from-blue-600 to-indigo-700",
                MarketingBanner.DisplayLocation.CATEGORY, 0);
        createBanner("Fashion Sale", "Trending styles", "Sale",
                "Shop Now", "/search?q=fashion", "from-pink-500 to-rose-600",
                MarketingBanner.DisplayLocation.CATEGORY, 1);
        createBanner("Books Sale", "Best reads", "Sale",
                "Shop Now", "/search?q=books", "from-amber-500 to-orange-600",
                MarketingBanner.DisplayLocation.CATEGORY, 2);
        createBanner("Home Essentials", "Upgrade your space", "Sale",
                "Shop Now", "/search?q=home", "from-emerald-500 to-teal-600",
                MarketingBanner.DisplayLocation.CATEGORY, 3);
    }

    private void seedAnnouncements() {
        if (announcementRepository.count() > 0) return;
        AnnouncementBar bar = new AnnouncementBar();
        bar.setText("Free Shipping Today on orders above ₹499");
        bar.setLink("/products");
        bar.setBackgroundColor("#4f46e5");
        bar.setTextColor("#ffffff");
        bar.setPriority(0);
        bar.setActive(true);
        announcementRepository.save(bar);
    }

    private void createBanner(String title, String subtitle, String badge, String cta, String link,
                              String gradient, MarketingBanner.DisplayLocation location, int priority) {
        MarketingBanner b = new MarketingBanner();
        b.setTitle(title);
        b.setSubtitle(subtitle);
        b.setBadge(badge);
        b.setButtonText(cta);
        b.setButtonLink(link);
        b.setGradient(gradient);
        b.setDisplayLocation(location);
        b.setPriority(priority);
        b.setActive(true);
        b.setStartDate(LocalDateTime.now().minusDays(1));
        b.setEndDate(LocalDateTime.now().plusMonths(3));
        bannerRepository.save(b);
    }
}
