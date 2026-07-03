package com.nearshare.api.controller;

import com.nearshare.api.entity.Listing;
import com.nearshare.api.entity.RentalRequest;
import com.nearshare.api.entity.User;
import com.nearshare.api.entity.WalletTransaction;
import com.nearshare.api.repository.ListingRepository;
import com.nearshare.api.repository.RentalRequestRepository;
import com.nearshare.api.repository.UserRepository;
import com.nearshare.api.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    @Autowired
    private RentalRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository transactionRepository;

    @Autowired
    private ListingRepository listingRepository;

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody RentalRequest request) {
        request.setStatus("PENDING");
        request.setPaymentStatus("UNPAID");
        RentalRequest savedRequest = requestRepository.save(request);
        return ResponseEntity.ok(savedRequest);
    }

    @GetMapping("/borrower/{userId}")
    public List<RentalRequest> getMyBorrows(@PathVariable Long userId) {
        return requestRepository.findByUserId(userId);
    }

    @GetMapping("/lender/{lenderId}")
    public List<RentalRequest> getRequestsForLender(@PathVariable Long lenderId) {
        return requestRepository.findByLenderId(lenderId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalRequest> getRequestById(@PathVariable Long id) {
        return requestRepository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return requestRepository.findById(id).map(req -> {
            String upperStatus = status.toUpperCase();
            
            // Handle transitioning to COMPLETED (returned item) -> Escrow refund and payouts
            if ("COMPLETED".equals(upperStatus) && "PAID".equals(req.getPaymentStatus())) {
                Listing listing = listingRepository.findById(req.getItemId()).orElse(null);
                
                double totalPaid = req.getAmount() != null ? req.getAmount() : 0.0;
                double deposit = (listing != null) ? listing.getDeposit() : (req.getAmount() != null ? req.getAmount() * 0.5 : 0.0);
                
                if (totalPaid < deposit) {
                    deposit = totalPaid;
                }
                
                double rentalFee = totalPaid - deposit;
                double platformFee = rentalFee * 0.10;
                double lenderEarnings = rentalFee - platformFee;
                
                // 1. Payout Borrower (Refund Security Deposit)
                User borrower = userRepository.findById(req.getUserId()).orElse(null);
                if (borrower != null) {
                    borrower.setWalletBalance(borrower.getWalletBalance() + deposit);
                    userRepository.save(borrower);
                    
                    WalletTransaction borrowerTx = new WalletTransaction(
                            borrower.getId(),
                            deposit,
                            "CREDIT",
                            "Security Deposit Refund for: " + req.getItemTitle()
                    );
                    transactionRepository.save(borrowerTx);
                }
                
                // 2. Payout Lender (Earnings minus Platform Fee)
                User lender = userRepository.findById(req.getLenderId()).orElse(null);
                if (lender != null) {
                    lender.setWalletBalance(lender.getWalletBalance() + lenderEarnings);
                    userRepository.save(lender);
                    
                    WalletTransaction lenderTx = new WalletTransaction(
                            lender.getId(),
                            lenderEarnings,
                            "CREDIT",
                            "Rental Earnings for: " + req.getItemTitle() + " (after platform fee)"
                    );
                    transactionRepository.save(lenderTx);
                }
                
                req.setPaymentStatus("COMPLETED");
            }
            
            req.setStatus(upperStatus);
            requestRepository.save(req);
            return ResponseEntity.ok("Request status updated to " + upperStatus);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> processPayment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam Double totalAmount) {

        return requestRepository.findById(id).map(req -> {
            User borrower = userRepository.findById(userId).orElse(null);
            if (borrower == null) {
                return ResponseEntity.badRequest().body("Borrower not found");
            }

            Double currentBalance = borrower.getWalletBalance();
            if (currentBalance == null) currentBalance = 0.0;
            if (currentBalance < totalAmount) {
                return ResponseEntity.badRequest().body("Insufficient Wallet Balance");
            }

            // Deduct balance
            borrower.setWalletBalance(currentBalance - totalAmount);
            userRepository.save(borrower);

            // Log Transaction
            WalletTransaction historyLog = new WalletTransaction(
                    borrower.getId(),
                    totalAmount,
                    "DEBIT",
                    "Security Deposit for: " + req.getItemTitle()
            );
            transactionRepository.save(historyLog);

            // Update Request details
            req.setPaymentStatus("PAID");
            req.setStartDate(LocalDate.parse(startDate));
            req.setReturnDate(LocalDate.parse(endDate));
            req.setAmount(totalAmount);
            req.setHandoverToken(String.valueOf((int)(Math.random() * 9000) + 1000));
            requestRepository.save(req);
            return ResponseEntity.ok("Payment Successful!");
        }).orElse(ResponseEntity.notFound().build());
    }


    // --- PHASE 2: DISPUTE & REFUND LOGIC ---

    @PutMapping("/{id}/dispute")
    public ResponseEntity<?> markAsDisputed(@PathVariable Long id) {
        return requestRepository.findById(id).map(req -> {
            if (!"PAID".equals(req.getPaymentStatus()))
                return ResponseEntity.badRequest().body("Only paid transactions can be disputed.");

            req.setPaymentStatus("DISPUTED");
            requestRepository.save(req);
            return ResponseEntity.ok("Dispute raised. Funds are frozen.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> processRefund(@PathVariable Long id) {
        return requestRepository.findById(id).map(req -> {
            if (!"DISPUTED".equals(req.getPaymentStatus()))
                return ResponseEntity.badRequest().body("Only disputed requests can be refunded.");

            // Calculate money split
            double total = req.getAmount();
            double refundToBorrower = total * 0.95;

            // Update Borrower Wallet
            userRepository.findById(req.getUserId()).ifPresent(user -> {
                user.setWalletBalance(user.getWalletBalance() + refundToBorrower);
                userRepository.save(user);
            });

            // Mark as refunded
            req.setPaymentStatus("REFUNDED");
            requestRepository.save(req);

            return ResponseEntity.ok("Refund processed successfully: " + refundToBorrower + " credited to user wallet.");
        }).orElse(ResponseEntity.notFound().build());
    }
}