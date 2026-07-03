//package com.nearshare.api.service;
//
//import com.nearshare.api.entity.*;
//import com.nearshare.api.repository.*;
//import jakarta.transaction.Transactional;
//import org.springframework.stereotype.Service;
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Service
//public class EscrowService {
//
//    private final OrderRepository orderRepo;
//    private final UserRepository userRepo;
//    private final TransactionRepository transactionRepo;
//    private final QRCodeService qrCodeService;
//
//    // Constructor Injection...
//
//    @Transactional
//    public Order initiateBorrowRequest(Long userId, Long listingId) {
//        // 1. Validate User & Listing
//        // 2. Check Wallet Balance (Cost + Deposit)
//        BigDecimal totalRequired = listing.getPrice().add(listing.getDepositAmount());
//
//        // 3. Deduct from User (Logic simplified)
//        user.setWalletBalance(user.getWalletBalance().subtract(totalRequired));
//
//        // 4. Create Order in ESCROW_HELD state
//        Order order = new Order();
//        order.setStatus(OrderStatus.ESCROW_HELD);
//        order.setEscrowAmount(totalRequired);
//        order.setUniqueHandoverCode(UUID.randomUUID().toString()); // Encoded in QR
//
//        // 5. Log Transaction
//        transactionRepo.save(new Transaction(userId, totalRequired, TransactionType.DEBIT, "ESCROW_LOCK"));
//
//        return orderRepo.save(order);
//    }
//
//    @Transactional
//    public void confirmHandover(String qrCodeData, Long providerId) {
//        Order order = orderRepo.findByUniqueHandoverCode(qrCodeData)
//                .orElseThrow(() -> new RuntimeException("Invalid QR"));
//
//        if(!order.getProviderId().equals(providerId)) throw new RuntimeException("Unauthorized");
//
//        order.setStatus(OrderStatus.ACTIVE);
//        order.setStartDate(LocalDateTime.now());
//        // Generate NEW QR code for the return phase
//        order.setUniqueReturnCode(UUID.randomUUID().toString());
//        orderRepo.save(order);
//    }
//
//    @Transactional
//    public void processReturn(String returnQrCode, Long providerId) {
//        Order order = orderRepo.findByUniqueReturnCode(returnQrCode).get();
//
//        // Calculate Fees
//        BigDecimal platformFee = order.getPrice().multiply(new BigDecimal("0.10")); // 10%
//        BigDecimal providerEarning = order.getPrice().subtract(platformFee);
//        BigDecimal userRefund = order.getDepositAmount();
//
//        // Distribute Money
//        User provider = userRepo.findById(order.getProviderId()).get();
//        User borrower = userRepo.findById(order.getBorrowerId()).get();
//
//        provider.setWalletBalance(provider.getWalletBalance().add(providerEarning));
//        borrower.setWalletBalance(borrower.getWalletBalance().add(userRefund));
//
//        order.setStatus(OrderStatus.COMPLETED);
//
//        // Log all transactions
//        transactionRepo.save(new Transaction(provider.getId(), providerEarning, TransactionType.CREDIT, "EARNING"));
//        transactionRepo.save(new Transaction(borrower.getId(), userRefund, TransactionType.CREDIT, "DEPOSIT_REFUND"));
//    }
//}