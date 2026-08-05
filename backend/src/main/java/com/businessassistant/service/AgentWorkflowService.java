package com.businessassistant.service;

import com.businessassistant.domain.Invoice;
import com.businessassistant.domain.Lead;
import com.businessassistant.domain.SupportTicket;
import com.businessassistant.dto.AgentWorkflowRequest;
import com.businessassistant.dto.AgentWorkflowResponse;
import com.businessassistant.dto.AiOrchestrationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AgentWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(AgentWorkflowService.class);

    private final RestClient aiServicesRestClient;
    private final BusinessDataService businessDataService;
    private final ObjectMapper objectMapper;

    public AgentWorkflowResponse runWorkflow(AgentWorkflowRequest request) {
        return runWorkflow(request.query());
    }

    public AgentWorkflowResponse runWorkflow(String query) {
        AiOrchestrationRequest payload = new AiOrchestrationRequest(query, buildContextPayload());

        try {
            // Serialize explicitly so the JSON shape always matches OrchestrationRequest.
            byte[] body = objectMapper.writeValueAsBytes(payload);

            AgentWorkflowResponse response = aiServicesRestClient.post()
                    .uri("/api/v1/orchestrate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(AgentWorkflowResponse.class);

            if (response != null) {
                persistTasksFromResults(response.results());
            }
            return response;
        } catch (RestClientResponseException ex) {
            String responseBody = ex.getResponseBodyAsString();
            log.error(
                    "AI orchestrate failed status={} body={} payloadQueryLength={}",
                    ex.getStatusCode().value(),
                    responseBody,
                    query != null ? query.length() : null
            );
            return new AgentWorkflowResponse(
                    "AI services rejected the orchestration request (HTTP " + ex.getStatusCode().value() + ").",
                    List.of("Manager agent received an error from Python orchestrator"),
                    List.of(Map.of(
                            "status", ex.getStatusCode().value(),
                            "error", responseBody != null && !responseBody.isBlank()
                                    ? responseBody
                                    : ex.getMessage()
                    ))
            );
        } catch (Exception ex) {
            log.error("AI orchestrate call failed", ex);
            return new AgentWorkflowResponse(
                    "AI services are unavailable. Start ai-services on port 8000.",
                    List.of("Manager agent could not reach Python orchestrator"),
                    List.of(Map.of("error", ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName()))
            );
        }
    }

    Map<String, Object> buildContextPayload() {
        Map<String, Object> context = new HashMap<>();
        context.put("overdue_invoices", toPlainList(businessDataService.getOverdueInvoices()));
        context.put("open_tickets", toPlainList(
                businessDataService.getTickets(null).stream()
                        .filter(ticket -> !"CLOSED".equals(ticket.getStatus().name())
                                && !"RESOLVED".equals(ticket.getStatus().name()))
                        .toList()
        ));
        context.put("leads", toPlainList(businessDataService.getLeads(null)));
        return context;
    }

    private List<Map<String, Object>> toPlainList(List<?> items) {
        List<Map<String, Object>> plainList = new ArrayList<>();
        for (Object item : items) {
            if (item == null) {
                continue;
            }
            plainList.add(toPlainMap(item));
        }
        return plainList;
    }

    private Map<String, Object> toPlainMap(Object item) {
        Map<String, Object> plainMap = new HashMap<>();

        if (item instanceof Invoice invoice) {
            plainMap.put("id", invoice.getId());
            plainMap.put("invoice_number", invoice.getInvoiceNumber());
            plainMap.put("customer_name", invoice.getCustomerName());
            plainMap.put("customer_email", invoice.getCustomerEmail());
            plainMap.put("amount", invoice.getAmount() != null ? invoice.getAmount().toPlainString() : null);
            plainMap.put("due_date", formatDate(invoice.getDueDate()));
            plainMap.put("status", invoice.getStatus() != null ? invoice.getStatus().name() : null);
            plainMap.put("created_at", formatInstant(invoice.getCreatedAt()));
            return plainMap;
        }

        if (item instanceof SupportTicket ticket) {
            plainMap.put("id", ticket.getId());
            plainMap.put("subject", ticket.getSubject());
            plainMap.put("description", ticket.getDescription());
            plainMap.put("customer_email", ticket.getCustomerEmail());
            plainMap.put("status", ticket.getStatus() != null ? ticket.getStatus().name() : null);
            plainMap.put("priority", ticket.getPriority());
            plainMap.put("created_at", formatInstant(ticket.getCreatedAt()));
            return plainMap;
        }

        if (item instanceof Lead lead) {
            plainMap.put("id", lead.getId());
            plainMap.put("name", lead.getName());
            plainMap.put("email", lead.getEmail());
            plainMap.put("company", lead.getCompany());
            plainMap.put("notes", lead.getNotes());
            plainMap.put("status", lead.getStatus() != null ? lead.getStatus().name() : null);
            plainMap.put("created_at", formatInstant(lead.getCreatedAt()));
            return plainMap;
        }

        plainMap.put("value", String.valueOf(item));
        return plainMap;
    }

    private static String formatDate(LocalDate date) {
        return date != null ? date.toString() : null;
    }

    private static String formatInstant(Instant instant) {
        return instant != null ? instant.toString() : null;
    }

    private void persistTasksFromResults(List<Map<String, Object>> results) {
        if (results == null) {
            return;
        }
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
        if (assignedAgent == null) {
            assignedAgent = taskMap.get("assignedAgent");
        }
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
