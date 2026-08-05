package com.businessassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AgentWorkflowRequest(
        @NotBlank
        @Size(min = 3, message = "query must be at least 3 characters")
        String query
) {
}
