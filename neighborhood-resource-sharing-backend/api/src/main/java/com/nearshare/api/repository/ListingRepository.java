package com.nearshare.api.repository;

import com.nearshare.api.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    // 1. Basic Filters
    List<Listing> findByCity(String city);
    List<Listing> findByProviderId(Long providerId); // Essential for "My Listings" page
    List<Listing> findByCategory(String category);

    // 2. Exact Pincode Search (Standard)
    List<Listing> findByPincode(String pincode);

    // 3. Pincode Range Search (+2 / -2 Logic)
    // SQL equivalent: SELECT * FROM listings WHERE pincode BETWEEN '451999' AND '452003'
    List<Listing> findByPincodeBetween(String minPincode, String maxPincode);
}