package com.trading.stock_stimulator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderHandler {

    @Autowired
    private PriceSimulator priceSimulator;

    @Autowired
    private Portfolio portfolio;

    private final List<Map<String, Object>> orders = new ArrayList<>();

    // Place order
    @PostMapping("/place")
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> orderRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            String symbol    = (String) orderRequest.get("symbol");
            String type      = (String) orderRequest.get("type");
            int quantity     = Integer.parseInt(orderRequest.get("quantity").toString());
            double userPrice = Double.parseDouble(orderRequest.get("price").toString());

            // Validate symbol
            if (symbol == null || symbol.isEmpty()) {
                response.put("success", false);
                response.put("message", "Invalid stock symbol");
                return response;
            }

            // Validate type
            if (!type.equals("BUY") && !type.equals("SELL")) {
                response.put("success", false);
                response.put("message", "Type must be BUY or SELL");
                return response;
            }

            // Validate quantity
            if (quantity <= 0) {
                response.put("success", false);
                response.put("message", "Quantity must be greater than 0");
                return response;
            }

            // Validate max quantity
            if (quantity > 1000) {
                response.put("success", false);
                response.put("message", "Maximum 1000 shares per order");
                return response;
            }

            // Get current price
            Map<String, Double> currentPrices = priceSimulator.getCurrentPrices();

            // Validate symbol exists
            if (!currentPrices.containsKey(symbol)) {
                response.put("success", false);
                response.put("message", "Stock symbol not found");
                return response;
            }

            double currentPrice = currentPrices.get(symbol);

            // Check race condition
            double priceDiff   = Math.abs(currentPrice - userPrice);
            boolean priceChanged = priceDiff > 2.0;

            // Execute via portfolio
            Map<String, Object> portfolioResult;
            if (type.equals("BUY")) {
                portfolioResult = portfolio.buyStock(symbol, quantity, currentPrice);
            } else {
                portfolioResult = portfolio.sellStock(symbol, quantity, currentPrice);
            }

            // If portfolio validation failed
            if (!(boolean) portfolioResult.get("success")) {
                return portfolioResult;
            }

            // Build order
            Map<String, Object> order = new HashMap<>();
            order.put("symbol",       symbol);
            order.put("type",         type);
            order.put("quantity",     quantity);
            order.put("price",        currentPrice);
            order.put("userPrice",    userPrice);
            order.put("priceChanged", priceChanged);
            order.put("category",     priceSimulator.getCategory(symbol));
            order.put("timestamp",    System.currentTimeMillis());

            orders.add(order);

            response.put("success",        true);
            response.put("message",        "Order placed successfully");
            response.put("order",          order);
            response.put("priceChanged",   priceChanged);
            response.put("currentPrice",   currentPrice);
            response.put("balance",        portfolioResult.get("balance"));
            response.put("holdings",       portfolioResult.get("holdings"));

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }

        return response;
    }

    // Get all orders
    @GetMapping("/all")
    public List<Map<String, Object>> getAllOrders() {
        return orders;
    }

    // Get portfolio summary
    @GetMapping("/portfolio")
    public Map<String, Object> getPortfolio() {
        return portfolio.getSummary(priceSimulator.getCurrentPrices());
    }

    // Get stocks by category
    @GetMapping("/category/{category}")
    public Map<String, Object> getByCategory(@PathVariable String category) {
        Map<String, Object> result = new HashMap<>();
        List<String> symbols = StockCategory.CATEGORIES.getOrDefault(category, new ArrayList<>());
        Map<String, Double> currentPrices = priceSimulator.getCurrentPrices();
        Map<String, Double> filteredPrices = new HashMap<>();
        for (String symbol : symbols) {
            if (currentPrices.containsKey(symbol)) {
                filteredPrices.put(symbol, currentPrices.get(symbol));
            }
        }
        result.put("category", category);
        result.put("stocks",   filteredPrices);
        return result;
    }

    // Clear orders
    @DeleteMapping("/clear")
    public Map<String, Object> clearOrders() {
        orders.clear();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All orders cleared");
        return response;
    }
}
