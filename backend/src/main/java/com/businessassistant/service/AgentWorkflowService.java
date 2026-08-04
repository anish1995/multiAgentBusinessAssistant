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
        return runWorkflow(request.query());
    }

    public AgentWorkflowResponse runWorkflow(String query) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", query);
        payload.put("context", Map.of(
                "overdue_invoices", businessDataService.getOverdueInvoices(),
                "open_tickets", businessDataService.getTickets(null).stream()
                        .filter(ticket -> !"CLOSED".equals(ticket.getStatus().name())
                                && !"RESOLVED".equals(ticket.getStatus().name()))
                        .toList(),
                "leads", businessDataService.getLeads(null)
        ));

        try {
            AgentWorkflowResponse response = aiServicesRestClient.post()
                    .uri("/api/v1/orchestrate")
                    .body(payload)
                    .retrieve()
                    .body(AgentWorkflowResponse.class);

            if (response != null) {
                persistTasksFromResults(response.results());
            }
            return response;
        } catch (Exception ex) {
            return new AgentWorkflowResponse(
                    "AI services are unavailable. Start ai-services on port 8000.",
                    List.of("Manager agent could not reach Python orchestrator"),
                    List.of(Map.of("error", ex.getMessage()))
            );
        }
    }

    private void persistTasksFromResults(List<Map<String, Object>> results) {
        for (Map<String, Object> result : results) {
            if ("create_follow_up_tasks".equals(result.get("action"))) {
                Object tasks = result.get("tasks");
                if (tasks instanceof List<?> taskList) {
                    for (Object item : taskList) {
                        if (item instanceof Map<?, ?> taskMap) {
                            createTaskFromMap(taskMap);
                        }
                    }
                }
            }
        }
    }

    private void createTaskFromMap(Map<?, ?> taskMap) {
        Object title = taskMap.get("title");
        Object description = taskMap.get("description");
        Object assignedAgent = taskMap.get("assigned_agent");
        if (title == null || assignedAgent == null) {
            return;
        }
        businessDataService.createTask(
                title.toString(),
                description != null ? description.toString() : null,
                assignedAgent.toString()
        );
    }
}
