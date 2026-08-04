package com.businessassistant.config;

import com.businessassistant.domain.*;
import com.businessassistant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "seed.data-enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private final LeadRepository leadRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedBusinessData();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }

        User admin = new User();
        admin.setEmail("admin@businessassistant.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Admin User");
        admin.setRole(UserRole.ADMIN);
        userRepository.save(admin);
    }

    private void seedBusinessData() {
        if (leadRepository.count() > 0) {
            return;
        }

        Lead lead = new Lead();
        lead.setName("Priya Sharma");
        lead.setEmail("priya@acmecorp.com");
        lead.setCompany("Acme Corp");
        lead.setNotes("Interested in enterprise plan");
        lead.setStatus(LeadStatus.QUALIFIED);
        leadRepository.save(lead);

        SupportTicket ticket = new SupportTicket();
        ticket.setSubject("Login issue on mobile app");
        ticket.setDescription("User cannot reset password on Android.");
        ticket.setCustomerEmail("user@example.com");
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setPriority("HIGH");
        supportTicketRepository.save(ticket);

        Invoice overdue = new Invoice();
        overdue.setInvoiceNumber("INV-2026-014");
        overdue.setCustomerName("Northwind Traders");
        overdue.setCustomerEmail("billing@northwind.com");
        overdue.setAmount(new BigDecimal("4200.00"));
        overdue.setDueDate(LocalDate.now().minusDays(12));
        overdue.setStatus(InvoiceStatus.OVERDUE);
        invoiceRepository.save(overdue);

        Invoice paid = new Invoice();
        paid.setInvoiceNumber("INV-2026-015");
        paid.setCustomerName("Globex LLC");
        paid.setCustomerEmail("ap@globex.com");
        paid.setAmount(new BigDecimal("1800.00"));
        paid.setDueDate(LocalDate.now().plusDays(10));
        paid.setStatus(InvoiceStatus.SENT);
        invoiceRepository.save(paid);

        Task task = new Task();
        task.setTitle("Follow up with Northwind Traders");
        task.setDescription("Call AP team about overdue invoice INV-2026-014");
        task.setAssignedAgent("finance");
        taskRepository.save(task);
    }
}
