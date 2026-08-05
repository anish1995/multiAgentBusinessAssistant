package com.businessassistant.dto;

import java.util.Map;

/**
 * Exact JSON body sent to ai-services POST /api/v1/orchestrate.
 * Field names must match Python OrchestrationRequest (query, context).
 */
public record AiOrchestrationRequest(
        String query,
        Map<String, Object> context
) {
}
