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
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class AgentWorkflowServiceTest {

    @Test
    void buildContextPayload_shouldUsePlainJsonSafeValues() {
        BusinessDataService businessDataService = Mockito.mock(BusinessDataService.class);

        Invoice invoice = new Invoice();
        invoice.setId(1L);
        invoice.setInvoiceNumber("INV-1001");
        invoice.setCustomerName("Acme");
        invoice.setCustomerEmail("billing@acme.com");
        invoice.setAmount(new BigDecimal("250.00"));
        invoice.setDueDate(LocalDate.now());
        invoice.setStatus(InvoiceStatus.OVERDUE);

        SupportTicket ticket = new SupportTicket();
        ticket.setId(2L);
        ticket.setSubject("Billing issue");
        ticket.setDescription("Invoice not paid");
        ticket.setCustomerEmail("customer@example.com");
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setPriority("HIGH");

        Lead lead = new Lead();
        lead.setId(3L);
        lead.setName("Jane Doe");
        lead.setEmail("jane@example.com");
        lead.setCompany("Contoso");
        lead.setNotes("Interested in pro plan");
        lead.setStatus(LeadStatus.NEW);

        Mockito.when(businessDataService.getOverdueInvoices()).thenReturn(List.of(invoice));
        Mockito.when(businessDataService.getTickets(null)).thenReturn(List.of(ticket));
        Mockito.when(businessDataService.getLeads(null)).thenReturn(List.of(lead));

        AgentWorkflowService service = new AgentWorkflowService(null, businessDataService);

        Map<String, Object> payload = service.buildContextPayload();

        assertInstanceOf(List.class, payload.get("overdue_invoices"));
        assertInstanceOf(List.class, payload.get("open_tickets"));
        assertInstanceOf(List.class, payload.get("leads"));

        Map<?, ?> invoicePayload = (Map<?, ?>) ((List<?>) payload.get("overdue_invoices")).get(0);
        assertEquals("INV-1001", invoicePayload.get("invoiceNumber"));
        assertEquals("OVERDUE", invoicePayload.get("status"));

        Map<?, ?> ticketPayload = (Map<?, ?>) ((List<?>) payload.get("open_tickets")).get(0);
        assertEquals("Billing issue", ticketPayload.get("subject"));
        assertEquals("OPEN", ticketPayload.get("status"));

        Map<?, ?> leadPayload = (Map<?, ?>) ((List<?>) payload.get("leads")).get(0);
        assertEquals("Jane Doe", leadPayload.get("name"));
        assertEquals("NEW", leadPayload.get("status"));
    }
}
