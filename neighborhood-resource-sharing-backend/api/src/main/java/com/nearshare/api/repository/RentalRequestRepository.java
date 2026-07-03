package com.nearshare.api.repository;

import com.nearshare.api.entity.RentalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {

    // Fetch requests where the user is the BORROWER
    List<RentalRequest> findByUserId(Long userId);

    // Fetch requests for a specific ITEM
    List<RentalRequest> findByItemId(Long itemId);

    // Fetch requests where the user is the LENDER (Owner)
    List<RentalRequest> findByLenderId(Long lenderId);

    // For QR Code verification
    RentalRequest findByHandoverToken(String handoverToken);

    // ✅ THIS IS THE MISSING PART CAUSING YOUR ERROR
    // Finds PAID requests that are still PENDING but the pickup date has passed
    @Query("SELECT r FROM RentalRequest r WHERE r.status = ?1 AND r.paymentStatus = ?2 AND r.startDate < ?3")
    List<RentalRequest> findExpiredRequests(String status, String paymentStatus, LocalDate today);
}