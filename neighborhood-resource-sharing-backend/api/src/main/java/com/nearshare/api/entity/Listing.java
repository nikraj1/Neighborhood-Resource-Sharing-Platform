package com.nearshare.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long providerId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private String itemCondition;
    private double price;
    private double deposit;
    private String address;
    private String city;
    private String pincode;

    // --- CHANGE: Store Image as Bytes ---
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imageData;

    private boolean active = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getItemCondition() { return itemCondition; }
    public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getDeposit() { return deposit; }
    public void setDeposit(double deposit) { this.deposit = deposit; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}