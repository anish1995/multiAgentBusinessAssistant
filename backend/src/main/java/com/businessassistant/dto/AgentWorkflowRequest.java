package com.businessassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AgentWorkflowRequest(
        @NotBlank
        @Size(min = 1, message = "query must not be blank")
        String query
) {
}
