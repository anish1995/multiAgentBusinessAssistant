package com.businessassistant.dto;

import jakarta.validation.constraints.NotBlank;

public record AgentWorkflowRequest(
        @NotBlank String query
) {
}
