package com.nearshare.api.entity;

import jakarta.persistence.*;

@Entity
public class PlatformFinance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalRevenue = 0.0; // The 5% cut accumulated

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
}