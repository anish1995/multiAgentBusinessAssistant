package com.businessassistant.service;

import com.businessassistant.domain.Invoice;
import com.businessassistant.domain.InvoiceStatus;
import com.businessassistant.domain.Lead;
import com.businessassistant.domain.LeadStatus;
import com.businessassistant.domain.SupportTicket;
import com.businessassistant.domain.TicketStatus;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AgentWorkflowServiceTest {

    @Test
    void buildContextPayload_shouldUsePlainJsonSafeSnakeCaseValues() {
        BusinessDataService businessDataService = Mockito.mock(BusinessDataService.class);

        Invoice invoice = new Invoice();
        invoice.setId(1L);
        invoice.setInvoiceNumber("INV-1001");
        invoice.setCustomerName("Acme");
        invoice.setCustomerEmail("billing@acme.com");
        invoice.setAmount(new BigDecimal("250.00"));
        invoice.setDueDate(LocalDate.of(2026, 8, 1));
        invoice.setStatus(InvoiceStatus.OVERDUE);
        invoice.setCreatedAt(Instant.parse("2026-07-01T10:15:30Z"));

        SupportTicket ticket = new SupportTicket();
        ticket.setId(2L);
        ticket.setSubject("Billing issue");
        ticket.setDescription("Invoice not paid");
        ticket.setCustomerEmail("customer@example.com");
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setPriority("HIGH");
        ticket.setCreatedAt(Instant.parse("2026-07-02T11:00:00Z"));

        Lead lead = new Lead();
        lead.setId(3L);
        lead.setName("Jane Doe");
        lead.setEmail("jane@example.com");
        lead.setCompany("Contoso");
        lead.setNotes("Interested in pro plan");
        lead.setStatus(LeadStatus.NEW);
        lead.setCreatedAt(Instant.parse("2026-07-03T12:00:00Z"));

        Mockito.when(businessDataService.getOverdueInvoices()).thenReturn(List.of(invoice));
        Mockito.when(businessDataService.getTickets(null)).thenReturn(List.of(ticket));
        Mockito.when(businessDataService.getLeads(null)).thenReturn(List.of(lead));

        AgentWorkflowService service = new AgentWorkflowService(null, businessDataService);

        Map<String, Object> payload = service.buildContextPayload();

        assertInstanceOf(List.class, payload.get("overdue_invoices"));
        assertInstanceOf(List.class, payload.get("open_tickets"));
        assertInstanceOf(List.class, payload.get("leads"));

        Map<?, ?> invoicePayload = (Map<?, ?>) ((List<?>) payload.get("overdue_invoices")).get(0);
        assertEquals("INV-1001", invoicePayload.get("invoice_number"));
        assertEquals("Acme", invoicePayload.get("customer_name"));
        assertEquals("billing@acme.com", invoicePayload.get("customer_email"));
        assertEquals("250.00", invoicePayload.get("amount"));
        assertEquals("2026-08-01", invoicePayload.get("due_date"));
        assertEquals("OVERDUE", invoicePayload.get("status"));
        assertEquals("2026-07-01T10:15:30Z", invoicePayload.get("created_at"));
        assertTrue(invoicePayload.get("due_date") instanceof String);
        assertTrue(invoicePayload.get("created_at") instanceof String);

        Map<?, ?> ticketPayload = (Map<?, ?>) ((List<?>) payload.get("open_tickets")).get(0);
        assertEquals("Billing issue", ticketPayload.get("subject"));
        assertEquals("customer@example.com", ticketPayload.get("customer_email"));
        assertEquals("OPEN", ticketPayload.get("status"));
        assertEquals("2026-07-02T11:00:00Z", ticketPayload.get("created_at"));

        Map<?, ?> leadPayload = (Map<?, ?>) ((List<?>) payload.get("leads")).get(0);
        assertEquals("Jane Doe", leadPayload.get("name"));
        assertEquals("NEW", leadPayload.get("status"));
        assertEquals("2026-07-03T12:00:00Z", leadPayload.get("created_at"));
    }
}
