package com.trading.stock_stimulator;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Arrays;

public class StockCategory {

    public static final Map<String, List<String>> CATEGORIES = new HashMap<>();

    static {
        CATEGORIES.put("TECH",    Arrays.asList("AAPL", "MSFT", "GOOGL", "META", "NVDA"));
        CATEGORIES.put("EV",      Arrays.asList("TSLA"));
        CATEGORIES.put("STREAM",  Arrays.asList("NFLX"));
        CATEGORIES.put("INDIAN",  Arrays.asList("RELIANCE", "INFY", "TCS", "WIPRO", "HDFC"));
        CATEGORIES.put("ECOMM",   Arrays.asList("AMZN"));
    }

    public static String getCategory(String symbol) {
        for (Map.Entry<String, List<String>> entry : CATEGORIES.entrySet()) {
            if (entry.getValue().contains(symbol)) {
                return entry.getKey();
            }
        }
        return "OTHER";
    }
}
