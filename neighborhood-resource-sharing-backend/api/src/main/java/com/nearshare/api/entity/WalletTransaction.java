package com.nearshare.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Double amount;
    private String type; // "CREDIT" (Added money) or "DEBIT" (Paid for rent)
    private String description;
    private LocalDateTime timestamp;

    public WalletTransaction() {
        this.timestamp = LocalDateTime.now();
    }

    public WalletTransaction(Long userId, Double amount, String type, String description) {
        this.userId = userId;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Double getAmount() { return amount; }
    public String getType() { return type; }
    public String getDescription() { return description; }
    public LocalDateTime getTimestamp() { return timestamp; }
}