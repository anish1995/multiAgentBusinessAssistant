package com.businessassistant.controller;

import com.businessassistant.domain.Invoice;
import com.businessassistant.domain.Lead;
import com.businessassistant.domain.SupportTicket;
import com.businessassistant.domain.Task;
import com.businessassistant.dto.*;
import com.businessassistant.service.AgentWorkflowService;
import com.businessassistant.service.BusinessDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessDataService businessDataService;
    private final AgentWorkflowService agentWorkflowService;

    @GetMapping("/dashboard/stats")
    public DashboardStats dashboardStats() {
        return businessDataService.getDashboardStats();
    }

    @GetMapping("/leads")
    public List<Lead> leads(@RequestParam(required = false) String search) {
        return businessDataService.getLeads(search);
    }

    @GetMapping("/leads/{id}")
    public Lead getLead(@PathVariable Long id) {
        return businessDataService.getLead(id);
    }

    @PostMapping("/leads")
    @PreAuthorize("hasRole('ADMIN')")
    public Lead createLead(@Valid @RequestBody CreateLeadRequest request) {
        return businessDataService.createLead(request);
    }

    @PutMapping("/leads/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Lead updateLead(@PathVariable Long id, @Valid @RequestBody UpdateLeadRequest request) {
        return businessDataService.updateLead(id, request);
    }

    @DeleteMapping("/leads/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteLead(@PathVariable Long id) {
        businessDataService.deleteLead(id);
    }

    @GetMapping("/tickets")
    public List<SupportTicket> tickets(@RequestParam(required = false) String search) {
        return businessDataService.getTickets(search);
    }

    @GetMapping("/tickets/{id}")
    public SupportTicket getTicket(@PathVariable Long id) {
        return businessDataService.getTicket(id);
    }

    @PostMapping("/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public SupportTicket createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return businessDataService.createTicket(request);
    }

    @PutMapping("/tickets/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SupportTicket updateTicket(@PathVariable Long id, @Valid @RequestBody UpdateTicketRequest request) {
        return businessDataService.updateTicket(id, request);
    }

    @DeleteMapping("/tickets/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTicket(@PathVariable Long id) {
        businessDataService.deleteTicket(id);
    }

    @GetMapping("/invoices")
    public List<Invoice> invoices(@RequestParam(required = false) String search) {
        return businessDataService.getInvoices(search);
    }

    @GetMapping("/invoices/{id}")
    public Invoice getInvoice(@PathVariable Long id) {
        return businessDataService.getInvoice(id);
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasRole('ADMIN')")
    public Invoice createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        return businessDataService.createInvoice(request);
    }

    @PutMapping("/invoices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Invoice updateInvoice(@PathVariable Long id, @Valid @RequestBody UpdateInvoiceRequest request) {
        return businessDataService.updateInvoice(id, request);
    }

    @DeleteMapping("/invoices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteInvoice(@PathVariable Long id) {
        businessDataService.deleteInvoice(id);
    }

    @GetMapping("/invoices/overdue")
    public List<Invoice> overdueInvoices() {
        return businessDataService.getOverdueInvoices();
    }

    @PostMapping("/invoices/send-reminders")
    @PreAuthorize("hasRole('ADMIN')")
    public AgentWorkflowResponse sendInvoiceReminders() {
        return agentWorkflowService.runWorkflow(
                new AgentWorkflowRequest("Find overdue invoices, draft reminder emails, and create follow-up tasks.")
        );
    }

    @GetMapping("/tasks")
    public List<Task> tasks(@RequestParam(required = false) String search) {
        return businessDataService.getTasks(search);
    }

    @GetMapping("/tasks/{id}")
    public Task getTask(@PathVariable Long id) {
        return businessDataService.getTask(id);
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasRole('ADMIN')")
    public Task createTask(@Valid @RequestBody CreateTaskRequest request) {
        return businessDataService.createTask(request);
    }

    @PutMapping("/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Task updateTask(@PathVariable Long id, @Valid @RequestBody UpdateTaskRequest request) {
        return businessDataService.updateTask(id, request);
    }

    @DeleteMapping("/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTask(@PathVariable Long id) {
        businessDataService.deleteTask(id);
    }

    @PostMapping("/agents/workflow")
    public AgentWorkflowResponse runWorkflow(@Valid @RequestBody AgentWorkflowRequest request) {
        return agentWorkflowService.runWorkflow(request);
    }
}
