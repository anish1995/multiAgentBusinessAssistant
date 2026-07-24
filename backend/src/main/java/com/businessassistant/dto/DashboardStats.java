package com.businessassistant.dto;

import com.businessassistant.domain.InvoiceStatus;
import com.businessassistant.domain.LeadStatus;
import com.businessassistant.domain.TicketStatus;

public record DashboardStats(
        long totalLeads,
        long openTickets,
        long overdueInvoices,
        long pendingTasks,
        LeadStatus topLeadStatus,
        TicketStatus topTicketStatus,
        InvoiceStatus topInvoiceStatus
) {
}
