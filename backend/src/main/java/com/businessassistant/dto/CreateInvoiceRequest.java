package com.businessassistant.dto;

import com.businessassistant.domain.InvoiceStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateInvoiceRequest(
        @NotBlank String invoiceNumber,
        @NotBlank String customerName,
        @NotBlank @Email String customerEmail,
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDate dueDate,
        InvoiceStatus status
) {
}
