package com.businessassistant.dto;

import java.util.List;
import java.util.Map;

public record AgentWorkflowResponse(
        String summary,
        List<String> steps,
        List<Map<String, Object>> results
) {
}
