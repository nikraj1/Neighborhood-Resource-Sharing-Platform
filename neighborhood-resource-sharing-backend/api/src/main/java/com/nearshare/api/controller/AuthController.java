package com.nearshare.api.controller;

import com.nearshare.api.entity.User;
import com.nearshare.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${google.client.id:878248881232-placeholder.apps.googleusercontent.com}")
    private String googleClientId;

    // --- HELPER METHOD: SHA-256 Hashing (Fallback for legacy accounts) ---
    private String hashPasswordLegacy(String plainPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(plainPassword.getBytes(StandardCharsets.UTF_8));

            // Convert byte array to Hex String
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // --- REGISTER API ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Error: Email already exists!");
        }

        // 1. Hash the password using BCrypt before saving
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        // 2. Save user
        userRepository.save(user);
        return ResponseEntity.ok("Success: User registered successfully!");
    }

    // --- LOGIN API ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginData) {
        // 1. Find user by email
        User user = userRepository.findByEmail(loginData.email);

        // 2. Hash the incoming password to compare with stored hash (supporting fallback/migration)
        if (user != null) {
            String storedPassword = user.getPassword();
            boolean matches = false;

            if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
                // Stored password is BCrypt
                matches = passwordEncoder.matches(loginData.password, storedPassword);
            } else {
                // Stored password is old SHA-256 legacy
                String legacyHash = hashPasswordLegacy(loginData.password);
                matches = legacyHash.equals(storedPassword);

                // Seamlessly migrate legacy account to BCrypt
                if (matches) {
                    user.setPassword(passwordEncoder.encode(loginData.password));
                    userRepository.save(user);
                }
            }

            if (matches) {
                // Security: Remove password before sending back to frontend
                user.setPassword(null);
                return ResponseEntity.ok(user);
            }
        }

        // 3. If login fails
        return ResponseEntity.status(401).body("Invalid Email or Password");
    }

    // --- GOOGLE SIGN-IN API ---
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload) {
        try {
            String idToken = payload.get("idToken");
            if (idToken == null || idToken.isEmpty()) {
                return ResponseEntity.badRequest().body("Error: ID Token is missing");
            }

            // 1. Call Google tokeninfo API to verify the token
            String googleTokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            RestTemplate restTemplate = new RestTemplate();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenInfo = restTemplate.getForObject(googleTokenInfoUrl, Map.class);

            if (tokenInfo == null || tokenInfo.containsKey("error_description")) {
                return ResponseEntity.status(401).body("Error: Invalid Google ID Token");
            }

            // 2. Validate client ID (aud claim) to prevent token injection
            String aud = (String) tokenInfo.get("aud");
            if (aud == null || !aud.equals(googleClientId)) {
                return ResponseEntity.status(401).body("Error: Token was not generated for this application.");
            }

            // 3. Extract user info
            String email = (String) tokenInfo.get("email");
            String name = (String) tokenInfo.get("name");

            if (email == null) {
                return ResponseEntity.status(400).body("Error: Email not provided by Google");
            }

            // 4. Find or register user
            User user = userRepository.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setFullName(name);
                user.setEmail(email);
                // Assign a secure random password for fallback
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setWalletBalance(0.0);
                userRepository.save(user);
            }

            // Security: remove password hash before response
            user.setPassword(null);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error during Google Authentication: " + e.getMessage());
        }
    }

    // --- INTERNAL CLASS FOR LOGIN DATA ---
    public static class LoginRequest {
        public String email;
        public String password;
    }
}