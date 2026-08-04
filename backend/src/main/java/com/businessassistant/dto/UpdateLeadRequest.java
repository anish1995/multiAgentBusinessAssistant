package com.businessassistant.dto;

import com.businessassistant.domain.LeadStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateLeadRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String company,
        String notes,
        @NotNull LeadStatus status
) {
}
