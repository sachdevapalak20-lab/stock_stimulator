package com.trading.stock_stimulator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class PriceHistoryController {

    @Autowired
    private PriceSimulator priceSimulator;

    @GetMapping("/{symbol}")
    public Map<String, Object> getPriceHistory(
            @PathVariable String symbol) {
        Map<String, Object> response = new HashMap<>();
        List<Double> history =
                priceSimulator.getPriceHistory(symbol);
        response.put("symbol",   symbol);
        response.put("history",  history);
        response.put("category",
                priceSimulator.getCategory(symbol));
        return response;
    }

    @GetMapping("/all")
    public Map<String, List<Double>> getAllHistory() {
        return priceSimulator.getAllPriceHistory();
    }
}