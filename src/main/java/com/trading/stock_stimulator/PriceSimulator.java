package com.trading.stock_stimulator;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
public class PriceSimulator {

    private final Random random = new Random();
    private final Map<String, Double> prices = new HashMap<>();
    private final Map<String, Double> drift = new HashMap<>();
    private final Map<String, Double> volatility = new HashMap<>();

    public PriceSimulator() {
        // Starting prices
        prices.put("AAPL",     180.0);
        prices.put("TSLA",     250.0);
        prices.put("RELIANCE", 1400.0);
        prices.put("GOOGL",    140.0);
        prices.put("AMZN",     178.0);
        prices.put("MSFT",     420.0);
        prices.put("META",     500.0);
        prices.put("NFLX",     650.0);
        prices.put("NVDA",     900.0);
        prices.put("INFY",     18.0);

        // Drift values
        drift.put("AAPL",     0.1);
        drift.put("TSLA",     0.2);
        drift.put("RELIANCE", 0.05);
        drift.put("GOOGL",    0.1);
        drift.put("AMZN",     0.1);
        drift.put("MSFT",     0.1);
        drift.put("META",     0.15);
        drift.put("NFLX",     0.12);
        drift.put("NVDA",     0.25);
        drift.put("INFY",     0.05);

        // Volatility values
        volatility.put("AAPL",     2.0);
        volatility.put("TSLA",     5.0);
        volatility.put("RELIANCE", 3.0);
        volatility.put("GOOGL",    2.0);
        volatility.put("AMZN",     2.5);
        volatility.put("MSFT",     2.0);
        volatility.put("META",     3.0);
        volatility.put("NFLX",     3.5);
        volatility.put("NVDA",     6.0);
        volatility.put("INFY",     1.0);
    }

    public Map<String, Double> getUpdatedPrices() {
        for (String symbol : prices.keySet()) {
            double currentPrice = prices.get(symbol);
            double d = drift.get(symbol);
            double v = volatility.get(symbol);

            // Random walk formula
            double newPrice = currentPrice + d + v * (random.nextDouble() * 2 - 1);

            // Price never goes below 1
            newPrice = Math.max(newPrice, 1.0);

            // Round to 2 decimal places
            newPrice = Math.round(newPrice * 100.0) / 100.0;

            prices.put(symbol, newPrice);
        }
        return prices;
    }

    public Map<String, Double> getCurrentPrices() {
        return prices;
    }
}