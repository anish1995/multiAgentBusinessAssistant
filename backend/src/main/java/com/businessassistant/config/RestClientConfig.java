package com.businessassistant.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient aiServicesRestClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai-services.base-url}") String baseUrl,
            @Value("${ai-services.api-key}") String apiKey
    ) {
        return restClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("X-Internal-Api-Key", apiKey)
                .build();
    }
}
