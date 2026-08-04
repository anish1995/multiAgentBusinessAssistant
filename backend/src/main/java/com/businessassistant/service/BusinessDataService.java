package com.businessassistant.service;

import com.businessassistant.domain.*;
import com.businessassistant.dto.*;
import com.businessassistant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessDataService {

    private final LeadRepository leadRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaskRepository taskRepository;

    public List<Lead> getLeads(String search) {
        if (search == null || search.isBlank()) {
            return leadRepository.findAll();
        }
        String term = search.toLowerCase();
        return leadRepository.findAll().stream()
                .filter(lead -> matches(term, lead.getName(), lead.getEmail(), lead.getCompany(), lead.getNotes()))
                .toList();
    }

    public Lead getLead(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
    }

    public Lead createLead(CreateLeadRequest request) {
        Lead lead = new Lead();
        lead.setName(request.name());
        lead.setEmail(request.email());
        lead.setCompany(request.company());
        lead.setNotes(request.notes());
        lead.setStatus(request.status() != null ? request.status() : LeadStatus.NEW);
        return leadRepository.save(lead);
    }

    public Lead updateLead(Long id, UpdateLeadRequest request) {
        Lead lead = getLead(id);
        lead.setName(request.name());
        lead.setEmail(request.email());
        lead.setCompany(request.company());
        lead.setNotes(request.notes());
        lead.setStatus(request.status());
        return leadRepository.save(lead);
    }

    public void deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found");
        }
        leadRepository.deleteById(id);
    }

    public List<SupportTicket> getTickets(String search) {
        if (search == null || search.isBlank()) {
            return supportTicketRepository.findAll();
        }
        String term = search.toLowerCase();
        return supportTicketRepository.findAll().stream()
                .filter(ticket -> matches(term, ticket.getSubject(), ticket.getDescription(), ticket.getCustomerEmail()))
                .toList();
    }

    public SupportTicket getTicket(Long id) {
        return supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    public SupportTicket createTicket(CreateTicketRequest request) {
        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(request.subject());
        ticket.setDescription(request.description());
        ticket.setCustomerEmail(request.customerEmail());
        ticket.setStatus(request.status() != null ? request.status() : TicketStatus.OPEN);
        ticket.setPriority(request.priority());
        return supportTicketRepository.save(ticket);
    }

    public SupportTicket updateTicket(Long id, UpdateTicketRequest request) {
        SupportTicket ticket = getTicket(id);
        ticket.setSubject(request.subject());
        ticket.setDescription(request.description());
        ticket.setCustomerEmail(request.customerEmail());
        ticket.setStatus(request.status());
        ticket.setPriority(request.priority());
        return supportTicketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        if (!supportTicketRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }
        supportTicketRepository.deleteById(id);
    }

    public List<Invoice> getInvoices(String search) {
        if (search == null || search.isBlank()) {
            return invoiceRepository.findAll();
        }
        String term = search.toLowerCase();
        return invoiceRepository.findAll().stream()
                .filter(invoice -> matches(term, invoice.getInvoiceNumber(), invoice.getCustomerName(),
                        invoice.getCustomerEmail(), invoice.getStatus().name()))
                .toList();
    }

    public Invoice getInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));
    }

    public Invoice createInvoice(CreateInvoiceRequest request) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(request.invoiceNumber());
        invoice.setCustomerName(request.customerName());
        invoice.setCustomerEmail(request.customerEmail());
        invoice.setAmount(request.amount());
        invoice.setDueDate(request.dueDate());
        invoice.setStatus(request.status() != null ? request.status() : InvoiceStatus.SENT);
        return invoiceRepository.save(invoice);
    }

    public Invoice updateInvoice(Long id, UpdateInvoiceRequest request) {
        Invoice invoice = getInvoice(id);
        invoice.setInvoiceNumber(request.invoiceNumber());
        invoice.setCustomerName(request.customerName());
        invoice.setCustomerEmail(request.customerEmail());
        invoice.setAmount(request.amount());
        invoice.setDueDate(request.dueDate());
        invoice.setStatus(request.status());
        return invoiceRepository.save(invoice);
    }

    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found");
        }
        invoiceRepository.deleteById(id);
    }

    public List<Invoice> getOverdueInvoices() {
        return invoiceRepository.findByStatus(InvoiceStatus.OVERDUE);
    }

    public List<Task> getTasks(String search) {
        if (search == null || search.isBlank()) {
            return taskRepository.findAll();
        }
        String term = search.toLowerCase();
        return taskRepository.findAll().stream()
                .filter(task -> matches(term, task.getTitle(), task.getDescription(), task.getAssignedAgent(), task.getStatus()))
                .toList();
    }

    public Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    public Task createTask(CreateTaskRequest request) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setAssignedAgent(request.assignedAgent());
        task.setStatus(request.status() != null ? request.status() : "PENDING");
        return taskRepository.save(task);
    }

    public Task createTask(String title, String description, String assignedAgent) {
        return createTask(new CreateTaskRequest(title, description, assignedAgent, "PENDING"));
    }

    public Task updateTask(Long id, UpdateTaskRequest request) {
        Task task = getTask(id);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setAssignedAgent(request.assignedAgent());
        task.setStatus(request.status());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        taskRepository.deleteById(id);
    }

    public DashboardStats getDashboardStats() {
        return new DashboardStats(
                leadRepository.count(),
                supportTicketRepository.findAll().stream()
                        .filter(ticket -> ticket.getStatus() == TicketStatus.OPEN
                                || ticket.getStatus() == TicketStatus.IN_PROGRESS)
                        .count(),
                invoiceRepository.findByStatus(InvoiceStatus.OVERDUE).size(),
                taskRepository.findAll().stream()
                        .filter(task -> "PENDING".equals(task.getStatus()))
                        .count(),
                LeadStatus.NEW,
                TicketStatus.OPEN,
                InvoiceStatus.OVERDUE
        );
    }

    private boolean matches(String term, String... values) {
        for (String value : values) {
            if (value != null && value.toLowerCase().contains(term)) {
                return true;
            }
        }
        return false;
    }
}
