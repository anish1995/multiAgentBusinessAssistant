package com.businessassistant.dto;

import com.businessassistant.domain.TicketStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketRequest(
        @NotBlank String subject,
        @NotBlank String description,
        @NotBlank @Email String customerEmail,
        @NotNull TicketStatus status,
        @NotBlank String priority
) {
}
