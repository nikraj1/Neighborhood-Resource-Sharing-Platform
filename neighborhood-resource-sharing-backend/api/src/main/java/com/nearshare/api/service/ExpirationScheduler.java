package com.nearshare.api.service;

import com.nearshare.api.entity.RentalRequest;
import com.nearshare.api.entity.User;
import com.nearshare.api.repository.RentalRequestRepository;
import com.nearshare.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpirationScheduler {

    @Autowired
    private RentalRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    // Runs every hour to check for expired pickups
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkExpiredPickups() {
        LocalDate today = LocalDate.now();

        // Find PAID requests that are still PENDING but the start date has passed
        List<RentalRequest> expiredRequests = requestRepository.findExpiredRequests("PENDING", "PAID", today);

        for (RentalRequest req : expiredRequests) {

            // 1. Calculate Refund (90%)
            double deposit = req.getAmount();
            double refundAmount = deposit * 0.90;
            double penalty = deposit * 0.10; // 10% Platform/Lister fee

            // 2. Refund the Buyer
            User buyer = userRepository.findById(req.getUserId()).orElse(null);
            if (buyer != null) {
                buyer.setWalletBalance(buyer.getWalletBalance() + refundAmount);
                userRepository.save(buyer);
            }

            // 3. Update Request Status
            req.setStatus("CANCELLED");
            req.setPaymentStatus("REFUNDED");
            requestRepository.save(req);

            System.out.println("Expired Request ID: " + req.getId() + ". Refunded: " + refundAmount);
        }
    }
}