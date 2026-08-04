package com.businessassistant.service;

import com.businessassistant.domain.RefreshToken;
import com.businessassistant.domain.User;
import com.businessassistant.domain.UserRole;
import com.businessassistant.dto.AuthResponse;
import com.businessassistant.dto.LoginRequest;
import com.businessassistant.dto.RefreshTokenRequest;
import com.businessassistant.dto.RegisterRequest;
import com.businessassistant.repository.RefreshTokenRepository;
import com.businessassistant.repository.UserRepository;
import com.businessassistant.security.JwtService;
import com.businessassistant.security.RefreshTokenService;
import com.businessassistant.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${auth.registration-enabled}")
    private boolean registrationEnabled;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return buildAuthResponse(securityUser.getUser());
    }

    public AuthResponse register(RegisterRequest request) {
        if (!registrationEnabled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registration is disabled");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(UserRole.USER);

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = refreshTokenService.hashToken(request.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return buildAuthResponse(stored.getUser());
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        String tokenHash = refreshTokenService.hashToken(request.refreshToken());
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private AuthResponse buildAuthResponse(User user) {
        SecurityUser securityUser = new SecurityUser(user);
        String accessToken = jwtService.generateToken(securityUser);
        String refreshTokenValue = refreshTokenService.generateTokenValue();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(refreshTokenService.hashToken(refreshTokenValue));
        refreshToken.setExpiresAt(refreshTokenService.expiryInstant());
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshTokenValue,
                "Bearer",
                jwtService.getExpirationMs(),
                refreshTokenService.getRefreshExpirationMs(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }
}
