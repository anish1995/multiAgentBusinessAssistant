package com.businessassistant.controller;

import com.businessassistant.domain.Invoice;
import com.businessassistant.domain.Lead;
import com.businessassistant.domain.SupportTicket;
import com.businessassistant.domain.Task;
import com.businessassistant.dto.AgentWorkflowRequest;
import com.businessassistant.dto.AgentWorkflowResponse;
import com.businessassistant.dto.DashboardStats;
import com.businessassistant.service.AgentWorkflowService;
import com.businessassistant.service.BusinessDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessDataService businessDataService;
    private final AgentWorkflowService agentWorkflowService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "business-assistant-backend");
    }

    @GetMapping("/dashboard/stats")
    public DashboardStats dashboardStats() {
        return businessDataService.getDashboardStats();
    }

    @GetMapping("/leads")
    public List<Lead> leads() {
        return businessDataService.getLeads();
    }

    @GetMapping("/tickets")
    public List<SupportTicket> tickets() {
        return businessDataService.getTickets();
    }

    @GetMapping("/invoices")
    public List<Invoice> invoices() {
        return businessDataService.getInvoices();
    }

    @GetMapping("/invoices/overdue")
    public List<Invoice> overdueInvoices() {
        return businessDataService.getOverdueInvoices();
    }

    @GetMapping("/tasks")
    public List<Task> tasks() {
        return businessDataService.getTasks();
    }

    @PostMapping("/agents/workflow")
    public AgentWorkflowResponse runWorkflow(@Valid @RequestBody AgentWorkflowRequest request) {
        return agentWorkflowService.runWorkflow(request);
    }
}
