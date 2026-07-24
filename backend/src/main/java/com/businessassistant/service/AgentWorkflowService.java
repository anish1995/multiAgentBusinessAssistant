package com.businessassistant.service;

import com.businessassistant.dto.AgentWorkflowRequest;
import com.businessassistant.dto.AgentWorkflowResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AgentWorkflowService {

    private final RestClient aiServicesRestClient;
    private final BusinessDataService businessDataService;

    public AgentWorkflowResponse runWorkflow(AgentWorkflowRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", request.query());
        payload.put("context", Map.of(
                "overdue_invoices", businessDataService.getOverdueInvoices(),
                "open_tickets", businessDataService.getTickets().stream()
                        .filter(ticket -> !"CLOSED".equals(ticket.getStatus().name())
                                && !"RESOLVED".equals(ticket.getStatus().name()))
                        .toList(),
                "leads", businessDataService.getLeads()
        ));

        try {
            return aiServicesRestClient.post()
                    .uri("/api/v1/orchestrate")
                    .body(payload)
                    .retrieve()
                    .body(AgentWorkflowResponse.class);
        } catch (Exception ex) {
            return new AgentWorkflowResponse(
                    "AI services are unavailable. Start ai-services on port 8000.",
                    List.of("Manager agent could not reach Python orchestrator"),
                    List.of(Map.of("error", ex.getMessage()))
            );
        }
    }
}
