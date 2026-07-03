package com.nearshare.api.controller;

public class PaymentRequest {
    private Long userId;
    private Long requestId;
    private Double amount;
    private Integer days;

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Integer getDays() { return days; }
    public void setDays(Integer days) { this.days = days; }
}