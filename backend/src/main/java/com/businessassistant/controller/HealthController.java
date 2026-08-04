package com.businessassistant.controller;

import com.businessassistant.dto.HealthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @Value("${ai-services.base-url}")
    private String aiServicesBaseUrl;

    @GetMapping("/health")
    public HealthResponse health() {
        Map<String, String> components = new HashMap<>();
        components.put("database", checkDatabase());
        components.put("aiServices", checkAiServices());

        String status = components.values().stream().allMatch("UP"::equals) ? "UP" : "DEGRADED";

        return new HealthResponse(status, "business-assistant-backend", components);
    }

    private String checkDatabase() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return "UP";
        } catch (Exception ex) {
            return "DOWN";
        }
    }

    private String checkAiServices() {
        try {
            Map<?, ?> response = RestClient.create(aiServicesBaseUrl)
                    .get()
                    .uri("/api/health")
                    .retrieve()
                    .body(Map.class);
            return response != null && "UP".equals(response.get("status")) ? "UP" : "DOWN";
        } catch (Exception ex) {
            return "DOWN";
        }
    }
}
