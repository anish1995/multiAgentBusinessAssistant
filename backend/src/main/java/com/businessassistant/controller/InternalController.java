package com.businessassistant.controller;

import com.businessassistant.domain.Task;
import com.businessassistant.dto.CreateTaskRequest;
import com.businessassistant.service.BusinessDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalController {

    private final BusinessDataService businessDataService;

    @PostMapping("/tasks")
    public Task createTask(@Valid @RequestBody CreateTaskRequest request) {
        return businessDataService.createTask(request);
    }
}
