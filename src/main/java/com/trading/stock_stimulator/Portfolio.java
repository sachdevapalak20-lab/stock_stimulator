package com.trading.stock_stimulator;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class Portfolio {

    // Starting balance
    private double balance = 10000.0;

    // Stocks owned → symbol, quantity
    private final Map<String, Integer> holdings = new HashMap<>();

    // Total amount spent
    private double totalInvested = 0.0;

    // Get current balance
    public double getBalance() {
        return Math.round(balance * 100.0) / 100.0;
    }

    // Buy stock
    public Map<String, Object> buyStock(String symbol, int quantity, double price) {
        Map<String, Object> result = new HashMap<>();
        double totalCost = quantity * price;

        // Check if enough balance
        if (totalCost > balance) {
            result.put("success", false);
            result.put("message", "Insufficient balance. Need $" + totalCost + " but have $" + balance);
            return result;
        }

        // Deduct balance
        balance -= totalCost;
        totalInvested += totalCost;

        // Add to holdings
        holdings.put(symbol, holdings.getOrDefault(symbol, 0) + quantity);

        result.put("success", true);
        result.put("message", "Bought " + quantity + " shares of " + symbol);
        result.put("balance", getBalance());
        result.put("holdings", holdings);
        return result;
    }

    // Sell stock
    public Map<String, Object> sellStock(String symbol, int quantity, double price) {
        Map<String, Object> result = new HashMap<>();

        // Check if owns enough shares
        int owned = holdings.getOrDefault(symbol, 0);
        if (owned < quantity) {
            result.put("success", false);
            result.put("message", "Not enough shares. You own " + owned + " shares of " + symbol);
            return result;
        }

        // Add to balance
        double totalValue = quantity * price;
        balance += totalValue;

        // Remove from holdings
        holdings.put(symbol, owned - quantity);
        if (holdings.get(symbol) == 0) {
            holdings.remove(symbol);
        }

        result.put("success", true);
        result.put("message", "Sold " + quantity + " shares of " + symbol);
        result.put("balance", getBalance());
        result.put("holdings", holdings);
        return result;
    }

    // Get portfolio summary
    public Map<String, Object> getSummary(Map<String, Double> currentPrices) {
        Map<String, Object> summary = new HashMap<>();

        // Calculate current portfolio value
        double portfolioValue = 0.0;
        for (Map.Entry<String, Integer> entry : holdings.entrySet()) {
            String symbol = entry.getKey();
            int quantity = entry.getValue();
            double currentPrice = currentPrices.getOrDefault(symbol, 0.0);
            portfolioValue += quantity * currentPrice;
        }

        // Calculate profit/loss
        double profitLoss = portfolioValue - totalInvested;

        summary.put("balance",        getBalance());
        summary.put("holdings",       holdings);
        summary.put("totalInvested",  Math.round(totalInvested * 100.0) / 100.0);
        summary.put("portfolioValue", Math.round(portfolioValue * 100.0) / 100.0);
        summary.put("profitLoss",     Math.round(profitLoss * 100.0) / 100.0);

        return summary;
    }

    public Map<String, Integer> getHoldings() {
        return holdings;
    }
}
