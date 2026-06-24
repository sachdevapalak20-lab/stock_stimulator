package com.trading.stock_stimulator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioController {

    @Autowired
    private Portfolio portfolio;

    @Autowired
    private PriceSimulator priceSimulator;

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return portfolio.getSummary(
                priceSimulator.getCurrentPrices());
    }

    @GetMapping("/balance")
    public Map<String, Object> getBalance() {
        Map<String, Object> response = new HashMap<>();
        response.put("balance", portfolio.getBalance());
        return response;
    }

    @GetMapping("/holdings")
    public Map<String, Integer> getHoldings() {
        return portfolio.getHoldings();
    }

    @PostMapping("/reset")
    public Map<String, Object> resetPortfolio() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Portfolio reset coming soon");
        return response;
    }
}