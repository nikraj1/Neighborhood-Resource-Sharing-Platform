package com.nearshare.api.controller;

import com.nearshare.api.entity.RentalRequest;
import com.nearshare.api.repository.RentalRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/handover")
@CrossOrigin(origins = "http://localhost:5173")
public class HandoverController {

    @Autowired
    private RentalRequestRepository requestRepository;

    @PostMapping("/verify-qr")
    public ResponseEntity<?> verifyHandover(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");

        // 1. Find request
        RentalRequest request = requestRepository.findByHandoverToken(token);

        if (request == null) {
            return ResponseEntity.badRequest().body("Invalid QR Code");
        }

        // 2. SAFETY CHECK: Has it expired/cancelled?
        if ("CANCELLED".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body("This transaction has EXPIRED. Refund processed.");
        }

        // 3. SAFETY CHECK: Is it already picked up?
        if ("ACTIVE".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body("Item already marked as Picked Up!");
        }

        // 4. Success: Start the Rental
        request.setStatus("ACTIVE");
        requestRepository.save(request);

        return ResponseEntity.ok(Map.of(
                "message", "Handover Successful! Rental Started.",
                "borrowerName", request.getBorrowerName() != null ? request.getBorrowerName() : "Borrower",
                "itemTitle", request.getItemTitle(),
                "requestId", request.getId()
        ));
    }
}