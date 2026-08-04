package com.businessassistant.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTaskRequest(
        @NotBlank String title,
        String description,
        @NotBlank String assignedAgent,
        String status
) {
}
