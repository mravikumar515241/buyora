package com.buyora.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DatabaseMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // Check if active column exists
            String checkColumnSql = "SELECT COUNT(*) FROM information_schema.columns " +
                    "WHERE table_name = 'users' AND column_name = 'active'";
            
            Integer columnExists = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);
            
            if (columnExists == null || columnExists == 0) {
                log.info("Adding 'active' column to users table...");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN active BOOLEAN");
                log.info("Column 'active' added successfully.");
            }
            
            // Update existing users to set active = true
            log.info("Updating existing users to set active = true...");
            int updatedRows = jdbcTemplate.update("UPDATE users SET active = true WHERE active IS NULL");
            log.info("Updated {} users with active = true", updatedRows);

            migrateInventoryColumns();
            migrateReviewColumns();
            migrateDiscoveryColumns();
            migrateHomepageSectionColumns();
            migrateWishlistSchema();
            migrateInventoryExtendedColumns();
            
        } catch (Exception e) {
            log.error("Error during database migration: ", e);
            // Don't fail the application startup for migration errors
        }
    }

    private void migrateInventoryColumns() {
        String checkReservedSql = "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_name = 'products' AND column_name = 'reserved_quantity'";

        Integer reservedExists = jdbcTemplate.queryForObject(checkReservedSql, Integer.class);
        if (reservedExists == null || reservedExists == 0) {
            log.info("Adding 'reserved_quantity' column to products table...");
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN reserved_quantity INTEGER NOT NULL DEFAULT 0");
        }

        int updated = jdbcTemplate.update("UPDATE products SET reserved_quantity = 0 WHERE reserved_quantity IS NULL");
        log.info("Ensured reserved_quantity defaults for {} products", updated);
    }

    private void migrateReviewColumns() {
        addColumnIfMissing("reviews", "order_id", "BIGINT");
        addColumnIfMissing("reviews", "order_item_id", "BIGINT");
        addColumnIfMissing("reviews", "moderation_status", "VARCHAR(20) NOT NULL DEFAULT 'VISIBLE'");
        addColumnIfMissing("reviews", "moderation_reason", "TEXT");
        addColumnIfMissing("reviews", "helpful_count", "INTEGER NOT NULL DEFAULT 0");
        addColumnIfMissing("reviews", "not_helpful_count", "INTEGER NOT NULL DEFAULT 0");

        jdbcTemplate.update("UPDATE reviews SET moderation_status = 'VISIBLE' WHERE moderation_status IS NULL");
        jdbcTemplate.update("UPDATE reviews SET helpful_count = 0 WHERE helpful_count IS NULL");
        jdbcTemplate.update("UPDATE reviews SET not_helpful_count = 0 WHERE not_helpful_count IS NULL");

        String checkImagesTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'review_images'";
        Integer imagesTableExists = jdbcTemplate.queryForObject(checkImagesTable, Integer.class);
        if (imagesTableExists == null || imagesTableExists == 0) {
            log.info("Creating review_images table...");
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS review_images (" +
                    "review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE, " +
                    "image_url VARCHAR(500))");
        }

        String checkVotesTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'review_helpful_votes'";
        Integer votesTableExists = jdbcTemplate.queryForObject(checkVotesTable, Integer.class);
        if (votesTableExists == null || votesTableExists == 0) {
            log.info("Creating review_helpful_votes table...");
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS review_helpful_votes (" +
                    "id BIGSERIAL PRIMARY KEY, " +
                    "created_at TIMESTAMP, updated_at TIMESTAMP, " +
                    "user_id BIGINT NOT NULL REFERENCES users(id), " +
                    "review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE, " +
                    "helpful BOOLEAN NOT NULL, " +
                    "UNIQUE(user_id, review_id))");
        }
    }

    private void migrateDiscoveryColumns() {
        addColumnIfMissing("products", "view_count", "BIGINT NOT NULL DEFAULT 0");
        jdbcTemplate.update("UPDATE products SET view_count = 0 WHERE view_count IS NULL");

        String checkTagsTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'product_tags'";
        Integer tagsTableExists = jdbcTemplate.queryForObject(checkTagsTable, Integer.class);
        if (tagsTableExists == null || tagsTableExists == 0) {
            log.info("Creating product_tags table...");
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS product_tags (" +
                    "product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE, " +
                    "tag VARCHAR(100))");
        }
    }

    private void migrateHomepageSectionColumns() {
        addColumnIfMissing("homepage_sections", "subtitle", "VARCHAR(500)");
        addColumnIfMissing("homepage_sections", "product_ids", "VARCHAR(2000)");
        addColumnIfMissing("homepage_sections", "section_type", "VARCHAR(50)");
        addColumnIfMissing("homepage_sections", "config_json", "TEXT");
    }

    private void migrateWishlistSchema() {
        String itemsTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'wishlist_items'";
        Integer itemsExists = jdbcTemplate.queryForObject(itemsTable, Integer.class);
        if (itemsExists == null || itemsExists == 0) {
            log.info("wishlist_items table not present yet; skipping wishlist data migration");
            return;
        }

        String collectionsTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'wishlist_collections'";
        Integer collectionsExists = jdbcTemplate.queryForObject(collectionsTable, Integer.class);
        if (collectionsExists == null || collectionsExists == 0) {
            log.info("Creating wishlist_collections table...");
            jdbcTemplate.execute(
                    "CREATE TABLE wishlist_collections (" +
                    "id BIGSERIAL PRIMARY KEY, " +
                    "created_at TIMESTAMP, " +
                    "updated_at TIMESTAMP, " +
                    "user_id BIGINT NOT NULL REFERENCES users(id), " +
                    "name VARCHAR(120) NOT NULL, " +
                    "default_list BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE', " +
                    "share_token VARCHAR(64) UNIQUE)");
        }

        String savedItemsTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'saved_items'";
        Integer savedItemsExists = jdbcTemplate.queryForObject(savedItemsTable, Integer.class);
        if (savedItemsExists == null || savedItemsExists == 0) {
            log.info("Creating saved_items table...");
            jdbcTemplate.execute(
                    "CREATE TABLE saved_items (" +
                    "id BIGSERIAL PRIMARY KEY, " +
                    "created_at TIMESTAMP, " +
                    "updated_at TIMESTAMP, " +
                    "user_id BIGINT NOT NULL REFERENCES users(id), " +
                    "product_id BIGINT NOT NULL REFERENCES products(id), " +
                    "price_at_save NUMERIC(12,2) NOT NULL, " +
                    "UNIQUE(user_id, product_id))");
        }

        addColumnIfMissing("wishlist_items", "collection_id", "BIGINT");

        // Backfill default collections for existing wishlist rows
        jdbcTemplate.execute(
                "INSERT INTO wishlist_collections (created_at, updated_at, user_id, name, default_list, visibility, share_token) " +
                "SELECT NOW(), NOW(), wi.user_id, 'My Wishlist', TRUE, 'PRIVATE', " +
                "md5(random()::text || wi.user_id::text || clock_timestamp()::text) " +
                "FROM wishlist_items wi " +
                "WHERE wi.collection_id IS NULL " +
                "AND NOT EXISTS (" +
                "  SELECT 1 FROM wishlist_collections wc WHERE wc.user_id = wi.user_id AND wc.default_list = TRUE" +
                ") " +
                "GROUP BY wi.user_id");

        int linked = jdbcTemplate.update(
                "UPDATE wishlist_items wi SET collection_id = wc.id " +
                "FROM wishlist_collections wc " +
                "WHERE wi.collection_id IS NULL " +
                "AND wi.user_id = wc.user_id " +
                "AND wc.default_list = TRUE");

        if (linked > 0) {
            log.info("Linked {} wishlist items to default collections", linked);
        }

        // Drop legacy unique constraint (user_id, product_id) if present
        try {
            jdbcTemplate.execute("ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_product_id_key");
        } catch (Exception e) {
            log.debug("Legacy wishlist unique constraint not present or already removed");
        }

        // Add new unique constraint on (collection_id, product_id) if missing
        String newConstraint = "SELECT COUNT(*) FROM information_schema.table_constraints " +
                "WHERE table_name = 'wishlist_items' AND constraint_name = 'wishlist_items_collection_id_product_id_key'";
        Integer constraintExists = jdbcTemplate.queryForObject(newConstraint, Integer.class);
        if (constraintExists == null || constraintExists == 0) {
            try {
                jdbcTemplate.execute(
                        "ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_collection_id_product_id_key " +
                        "UNIQUE (collection_id, product_id)");
            } catch (Exception e) {
                log.warn("Could not add wishlist collection/product unique constraint: {}", e.getMessage());
            }
        }

        // FK to wishlist_collections (nullable until backfill completes)
        String fkCheck = "SELECT COUNT(*) FROM information_schema.table_constraints " +
                "WHERE table_name = 'wishlist_items' AND constraint_name = 'fk_wishlist_items_collection'";
        Integer fkExists = jdbcTemplate.queryForObject(fkCheck, Integer.class);
        if (fkExists == null || fkExists == 0) {
            try {
                jdbcTemplate.execute(
                        "ALTER TABLE wishlist_items ADD CONSTRAINT fk_wishlist_items_collection " +
                        "FOREIGN KEY (collection_id) REFERENCES wishlist_collections(id)");
            } catch (Exception e) {
                log.debug("Wishlist collection FK already exists or not yet applicable: {}", e.getMessage());
            }
        }
    }

    private void migrateInventoryExtendedColumns() {
        addColumnIfMissing("products", "sold_quantity", "INTEGER NOT NULL DEFAULT 0");
        addColumnIfMissing("products", "sku", "VARCHAR(64)");
        addColumnIfMissing("products", "low_stock_threshold", "INTEGER NOT NULL DEFAULT 10");
        addColumnIfMissing("products", "reorder_threshold", "INTEGER NOT NULL DEFAULT 5");
        addColumnIfMissing("products", "stock_status_override", "VARCHAR(30)");
        addColumnIfMissing("products", "expected_restock_date", "DATE");

        jdbcTemplate.update("UPDATE products SET sold_quantity = 0 WHERE sold_quantity IS NULL");
        jdbcTemplate.update("UPDATE products SET low_stock_threshold = 10 WHERE low_stock_threshold IS NULL");
        jdbcTemplate.update("UPDATE products SET reorder_threshold = 5 WHERE reorder_threshold IS NULL");

        String restockTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'stock_restock_subscriptions'";
        Integer restockExists = jdbcTemplate.queryForObject(restockTable, Integer.class);
        if (restockExists == null || restockExists == 0) {
            log.info("Creating stock_restock_subscriptions table...");
            jdbcTemplate.execute(
                    "CREATE TABLE stock_restock_subscriptions (" +
                    "id BIGSERIAL PRIMARY KEY, " +
                    "created_at TIMESTAMP, updated_at TIMESTAMP, " +
                    "user_id BIGINT NOT NULL REFERENCES users(id), " +
                    "product_id BIGINT NOT NULL REFERENCES products(id), " +
                    "active BOOLEAN NOT NULL DEFAULT TRUE, " +
                    "notified BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "UNIQUE(user_id, product_id))");
        }
    }

    private void addColumnIfMissing(String table, String column, String definition) {
        String checkSql = "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_name = ? AND column_name = ?";
        Integer exists = jdbcTemplate.queryForObject(checkSql, Integer.class, table, column);
        if (exists == null || exists == 0) {
            log.info("Adding '{}' column to {} table...", column, table);
            jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
        }
    }
}
