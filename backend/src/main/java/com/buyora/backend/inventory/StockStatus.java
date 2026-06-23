package com.buyora.backend.inventory;

public enum StockStatus {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK,
    DISCONTINUED,
    COMING_SOON,
    PRE_ORDER;

    public static StockStatus fromAvailable(int available, int lowStockThreshold) {
        if (available <= 0) {
            return OUT_OF_STOCK;
        }
        if (available <= lowStockThreshold) {
            return LOW_STOCK;
        }
        return IN_STOCK;
    }

    public boolean isPurchasable(int available) {
        return switch (this) {
            case IN_STOCK, LOW_STOCK -> available > 0;
            case PRE_ORDER -> true;
            case OUT_OF_STOCK, DISCONTINUED, COMING_SOON -> false;
        };
    }
}
