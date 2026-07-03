package com.nearshare.api.controller;

import com.nearshare.api.entity.User;
import com.nearshare.api.entity.RentalRequest;
import com.nearshare.api.entity.WalletTransaction; // ✅ Import Transaction Entity
import com.nearshare.api.repository.UserRepository;
import com.nearshare.api.repository.RentalRequestRepository;
import com.nearshare.api.repository.WalletTransactionRepository; // ✅ Import Transaction Repo
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID; // ✅ Import UUID for QR Token

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RentalRequestRepository requestRepository;

    @Autowired
    private WalletTransactionRepository transactionRepository; // ✅ Inject Transaction Repo

    @PostMapping("/pay-wallet")
    public ResponseEntity<?> payWithWallet(@RequestBody PaymentRequest payload) {
        try {
            // Debug Logs
            System.out.println("PAYMENT DEBUG: UserId=" + payload.getUserId() +
                    ", RequestId=" + payload.getRequestId() +
                    ", Amount=" + payload.getAmount());

            // 1. Validation
            if (payload.getUserId() == null) return ResponseEntity.badRequest().body("Error: User ID is missing.");
            if (payload.getRequestId() == null) return ResponseEntity.badRequest().body("Error: Request ID is missing.");

            // We expect the Frontend to send the FULL Security Deposit amount now
            if (payload.getAmount() == null) return ResponseEntity.badRequest().body("Error: Amount is missing.");

            Long userId = payload.getUserId();
            Long requestId = payload.getRequestId();
            Double amountToPay = payload.getAmount();

            // 2. Fetch User & Request
            User user = userRepository.findById(userId).orElse(null);
            RentalRequest request = requestRepository.findById(requestId).orElse(null);

            if (user == null) return ResponseEntity.badRequest().body("User not found (ID: " + userId + ")");
            if (request == null) return ResponseEntity.badRequest().body("Request not found (ID: " + requestId + ")");

            // 3. Check Balance
            Double currentBalance = user.getWalletBalance();
            if (currentBalance == null) currentBalance = 0.0;

            if (currentBalance < amountToPay) {
                return ResponseEntity.status(400).body("Insufficient Wallet Balance");
            }

            // 4. Deduct Money
            user.setWalletBalance(currentBalance - amountToPay);
            userRepository.save(user);

            // 5. Update Request Status & Generate QR Token
            request.setPaymentStatus("PAID");
            request.setAmount(amountToPay);
            request.setTransactionId("TXN_" + System.currentTimeMillis());

            // ✅ GENERATE SECRET QR TOKEN
            String secretToken = UUID.randomUUID().toString();
            request.setHandoverToken(secretToken);

            // Set default location if missing
            if(request.getMeetingLat() == null) {
                request.setMeetingLat(22.7196);
                request.setMeetingLng(75.8577);
            }

            requestRepository.save(request);

            // 6. ✅ SAVE TO WALLET HISTORY
            WalletTransaction historyLog = new WalletTransaction(
                    user.getId(),
                    amountToPay,
                    "DEBIT",
                    "Security Deposit for: " + request.getItemTitle()
            );
            transactionRepository.save(historyLog);

            return ResponseEntity.ok(Map.of(
                    "message", "Payment Successful",
                    "newBalance", user.getWalletBalance(),
                    "transactionId", request.getTransactionId(),
                    "handoverToken", secretToken // ✅ Send Token to Frontend for QR
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server Error: " + e.getMessage());
        }
    }

    // 7. Payment Success & Location Confirm (Called by TransactionDetails.tsx)
    @PostMapping("/success")
    public ResponseEntity<?> confirmPaymentSuccess(@RequestBody Map<String, Object> payload) {
        try {
            Long requestId = ((Number) payload.get("requestId")).longValue();
            Double lat = ((Number) payload.get("lat")).doubleValue();
            Double lng = ((Number) payload.get("lng")).doubleValue();

            RentalRequest request = requestRepository.findById(requestId).orElse(null);
            if (request == null) {
                return ResponseEntity.badRequest().body("Request not found");
            }

            request.setMeetingLat(lat);
            request.setMeetingLng(lng);

            if (!"PAID".equals(request.getPaymentStatus())) {
                User borrower = userRepository.findById(request.getUserId()).orElse(null);
                if (borrower == null) {
                    return ResponseEntity.badRequest().body("Borrower not found");
                }

                Double amountToPay = request.getAmount();
                if (amountToPay == null) amountToPay = 500.0;

                Double currentBalance = borrower.getWalletBalance();
                if (currentBalance == null) currentBalance = 0.0;

                if (currentBalance < amountToPay) {
                    return ResponseEntity.status(400).body("Insufficient Wallet Balance. Please add funds.");
                }

                borrower.setWalletBalance(currentBalance - amountToPay);
                userRepository.save(borrower);

                WalletTransaction historyLog = new WalletTransaction(
                        borrower.getId(),
                        amountToPay,
                        "DEBIT",
                        "Security Deposit for: " + request.getItemTitle()
                );
                transactionRepository.save(historyLog);

                request.setPaymentStatus("PAID");
                request.setTransactionId("TXN_" + System.currentTimeMillis());
                request.setHandoverToken(UUID.randomUUID().toString());
            }

            requestRepository.save(request);
            return ResponseEntity.ok(Map.of("message", "Payment Confirmed"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server Error: " + e.getMessage());
        }
    }
}