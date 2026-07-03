package com.nearshare.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disable CSRF (Critical for POST APIs)
                .csrf(csrf -> csrf.disable())

                // 2. Enable CORS with the source defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Security Headers
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                        .xssProtection(xss -> xss.headerValue(org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.tile.openstreetmap.org https://images.unsplash.com https://via.placeholder.com https://placehold.co https://lh3.googleusercontent.com; connect-src 'self' http://localhost:8080 https://accounts.google.com https://oauth2.googleapis.com; frame-src 'self' https://accounts.google.com;"))
                )

                // 4. Define Public URLs (Allow these without login check)
                .authorizeHttpRequests(auth -> auth

                        // Auth (Login/Register)
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ Listings (View and Create)
                        .requestMatchers("/api/listings/**").permitAll()

                        // ✅ File Uploads (For images)
                        .requestMatchers("/api/upload/**").permitAll()

                        // ✅ Serve Images (View uploaded pictures)
                        .requestMatchers("/uploads/**").permitAll()

                        // Allow everything else for now (Development Mode)
                        // Change this to .authenticated() later when JWT is ready
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    // CORS Configuration (Essential for React to talk to Spring Boot)
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Dynamic CORS origin patterns based on properties configuration
        configuration.setAllowedOriginPatterns(allowedOrigins);

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}