package com.businessassistant.dto;

import com.businessassistant.domain.LeadStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateLeadRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String company,
        String notes,
        LeadStatus status
) {
}
