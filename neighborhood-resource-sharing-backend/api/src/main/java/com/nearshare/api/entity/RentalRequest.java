package com.nearshare.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "rental_requests")
public class RentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ THE CRITICAL FIX: Telling Spring Boot to use the correct column!
    @Column(name = "borrower_id")
    private Long userId;        // The Borrower

    private Long itemId;        // The Item
    private Long lenderId;      // The Owner

    private String itemTitle;
    private String lenderName;
    private String lenderPhone;

    private String borrowerName; // Added for scanner

    // ✅ NEW: Added the borrower's phone number!
    @Column(name = "borrower_phone")
    private String borrowerPhone;

    private Double meetingLat;
    private Double meetingLng;

    private String status;         // PENDING, APPROVED, REJECTED
    private String paymentStatus;  // UNPAID, PAID
    private Double amount;         // Security Deposit
    private Double price;          // Daily Rate

    private String transactionId;  // For wallet tracking
    private String handoverToken;  // For QR Code

    private LocalDate returnDate;  // For return scheduling
    private LocalDate startDate;   // For the background tasks

    // ✅ FIX: Added requestDate so React doesn't crash!
    private LocalDate requestDate;

    // --- GETTERS AND SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Long getLenderId() { return lenderId; }
    public void setLenderId(Long lenderId) { this.lenderId = lenderId; }

    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }

    public String getLenderName() { return lenderName; }
    public void setLenderName(String lenderName) { this.lenderName = lenderName; }

    public String getLenderPhone() { return lenderPhone; }
    public void setLenderPhone(String lenderPhone) { this.lenderPhone = lenderPhone; }

    public String getBorrowerName() { return borrowerName; }
    public void setBorrowerName(String borrowerName) { this.borrowerName = borrowerName; }

    // ✅ NEW: Getter and Setter for Borrower Phone
    public String getBorrowerPhone() { return borrowerPhone; }
    public void setBorrowerPhone(String borrowerPhone) { this.borrowerPhone = borrowerPhone; }

    public Double getMeetingLat() { return meetingLat; }
    public void setMeetingLat(Double meetingLat) { this.meetingLat = meetingLat; }

    public Double getMeetingLng() { return meetingLng; }
    public void setMeetingLng(Double meetingLng) { this.meetingLng = meetingLng; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getHandoverToken() { return handoverToken; }
    public void setHandoverToken(String handoverToken) { this.handoverToken = handoverToken; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }
}