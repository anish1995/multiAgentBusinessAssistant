package com.businessassistant.service;

import com.businessassistant.domain.*;
import com.businessassistant.dto.DashboardStats;
import com.businessassistant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessDataService {

    private final LeadRepository leadRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaskRepository taskRepository;

    public List<Lead> getLeads() {
        return leadRepository.findAll();
    }

    public List<SupportTicket> getTickets() {
        return supportTicketRepository.findAll();
    }

    public List<Invoice> getInvoices() {
        return invoiceRepository.findAll();
    }

    public List<Invoice> getOverdueInvoices() {
        return invoiceRepository.findByStatus(InvoiceStatus.OVERDUE);
    }

    public List<Task> getTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(String title, String description, String assignedAgent) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setAssignedAgent(assignedAgent);
        return taskRepository.save(task);
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
}
