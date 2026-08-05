package com.businessassistant.service;

import com.businessassistant.domain.Invoice;
import com.businessassistant.domain.Lead;
import com.businessassistant.domain.SupportTicket;
import com.businessassistant.dto.AgentWorkflowRequest;
import com.businessassistant.dto.AgentWorkflowResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
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
        payload.put("context", buildContextPayload());

        try {
            AgentWorkflowResponse response = aiServicesRestClient.post()
                    .uri("/api/v1/orchestrate")
                    .contentType(MediaType.APPLICATION_JSON)
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

    Map<String, Object> buildContextPayload() {
        Map<String, Object> context = new HashMap<>();
        context.put("overdue_invoices", toPlainList(businessDataService.getOverdueInvoices(), Invoice.class));
        context.put("open_tickets", toPlainList(
                businessDataService.getTickets(null).stream()
                        .filter(ticket -> !"CLOSED".equals(ticket.getStatus().name())
                                && !"RESOLVED".equals(ticket.getStatus().name()))
                        .toList(),
                SupportTicket.class
        ));
        context.put("leads", toPlainList(businessDataService.getLeads(null), Lead.class));
        return context;
    }

    private List<Map<String, Object>> toPlainList(List<?> items, Class<?> type) {
        List<Map<String, Object>> plainList = new ArrayList<>();
        for (Object item : items) {
            if (item == null) {
                continue;
            }
            plainList.add(toPlainMap(item, type));
        }
        return plainList;
    }

    private Map<String, Object> toPlainMap(Object item, Class<?> type) {
        Map<String, Object> plainMap = new HashMap<>();

        if (item instanceof Invoice invoice) {
            plainMap.put("id", invoice.getId());
            plainMap.put("invoiceNumber", invoice.getInvoiceNumber());
            plainMap.put("customerName", invoice.getCustomerName());
            plainMap.put("customerEmail", invoice.getCustomerEmail());
            plainMap.put("amount", invoice.getAmount());
            plainMap.put("dueDate", invoice.getDueDate());
            plainMap.put("status", invoice.getStatus() != null ? invoice.getStatus().name() : null);
            plainMap.put("createdAt", invoice.getCreatedAt());
            return plainMap;
        }

        if (item instanceof SupportTicket ticket) {
            plainMap.put("id", ticket.getId());
            plainMap.put("subject", ticket.getSubject());
            plainMap.put("description", ticket.getDescription());
            plainMap.put("customerEmail", ticket.getCustomerEmail());
            plainMap.put("status", ticket.getStatus() != null ? ticket.getStatus().name() : null);
            plainMap.put("priority", ticket.getPriority());
            plainMap.put("createdAt", ticket.getCreatedAt());
            return plainMap;
        }

        if (item instanceof Lead lead) {
            plainMap.put("id", lead.getId());
            plainMap.put("name", lead.getName());
            plainMap.put("email", lead.getEmail());
            plainMap.put("company", lead.getCompany());
            plainMap.put("notes", lead.getNotes());
            plainMap.put("status", lead.getStatus() != null ? lead.getStatus().name() : null);
            plainMap.put("createdAt", lead.getCreatedAt());
            return plainMap;
        }

        plainMap.put("value", item);
        return plainMap;
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
