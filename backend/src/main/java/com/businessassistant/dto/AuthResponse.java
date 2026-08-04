package com.businessassistant.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        String tokenType,
        long expiresInMs,
        long refreshExpiresInMs,
        String email,
        String fullName,
        String role
) {
}
