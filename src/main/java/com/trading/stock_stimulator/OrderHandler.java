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

    // Store all orders in memory
    private final List<Map<String, Object>> orders = new ArrayList<>();

    // Place a new order
    @PostMapping("/place")
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> orderRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Get order details
            String symbol   = (String) orderRequest.get("symbol");
            String type     = (String) orderRequest.get("type");
            int quantity    = Integer.parseInt(orderRequest.get("quantity").toString());
            double userPrice = Double.parseDouble(orderRequest.get("price").toString());

            // Validate inputs
            if (symbol == null || symbol.isEmpty()) {
                response.put("success", false);
                response.put("message", "Invalid stock symbol");
                return response;
            }

            if (!type.equals("BUY") && !type.equals("SELL")) {
                response.put("success", false);
                response.put("message", "Type must be BUY or SELL");
                return response;
            }

            if (quantity <= 0) {
                response.put("success", false);
                response.put("message", "Quantity must be greater than 0");
                return response;
            }

            // Get current live price
            Map<String, Double> currentPrices = priceSimulator.getCurrentPrices();
            double currentPrice = currentPrices.get(symbol);