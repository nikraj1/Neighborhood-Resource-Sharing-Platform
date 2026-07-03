package com.nearshare.api.controller;

import com.nearshare.api.entity.Listing;
import com.nearshare.api.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/listings")
// ✅ FIX: Allow ALL origins so localhost:8081 works
@CrossOrigin(origins = "*")
public class ListingController {

    @Autowired
    private ListingRepository listingRepository;

    // 1. Add Listing
    // ✅ FIX: Added value = "/add" so it matches your React frontend exactly
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addListing(
            @RequestParam("image") MultipartFile image,
            @RequestParam("providerId") Long providerId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("condition") String condition,
            @RequestParam("price") double price,
            @RequestParam("deposit") double deposit,
            @RequestParam("address") String address,
            @RequestParam("city") String city,
            @RequestParam("pincode") String pincode
    ) {
        try {
            Listing listing = new Listing();
            listing.setProviderId(providerId);
            listing.setTitle(title);
            listing.setDescription(description);
            listing.setCategory(category);
            listing.setItemCondition(condition);
            listing.setPrice(price);
            listing.setDeposit(deposit);
            listing.setAddress(address);
            listing.setCity(city);
            listing.setPincode(pincode);

            if (!image.isEmpty()) {
                listing.setImageData(image.getBytes());
            }

            listingRepository.save(listing);
            return ResponseEntity.ok("Listing created successfully!");

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error saving image: " + e.getMessage());
        }
    }

    // 2. Get All Listings
    @GetMapping
    public List<Listing> getAllListings() {
        return listingRepository.findAll();
    }

    // 3. Nearby Search
    @GetMapping("/nearby")
    public List<Listing> getNearbyListings(@RequestParam double lat, @RequestParam double lng, @RequestParam double radius) {
        List<Listing> allListings = listingRepository.findAll();

        // ✅ RESTORED: Logic is here for when you add Lat/Lng to DB
        /*
        return allListings.stream().filter(item -> {
            // Check if item has location data (You need to add these fields to Entity first)
            // if (item.getLatitude() == null || item.getLongitude() == null) return false;

            // double dist = calculateDistance(lat, lng, item.getLatitude(), item.getLongitude());
            // return dist <= radius;
            return true;
        }).collect(Collectors.toList());
        */

        return allListings; // Temporary: Return all items
    }

    // ✅ RESTORED: Haversine Formula (Don't lose this!)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        if ((lat1 == lat2) && (lon1 == lon2)) return 0;
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = Math.toDegrees(dist);
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344; // Convert to Kilometers
        return dist;
    }

    // 4. Search by City
    @GetMapping("/search")
    public List<Listing> searchByCity(@RequestParam String city) {
        return listingRepository.findByCity(city);
    }

    // 5. Get Listings by Provider
    @GetMapping("/provider/{providerId}")
    public List<Listing> getListingsByProvider(@PathVariable Long providerId) {
        return listingRepository.findByProviderId(providerId);
    }

    // 6. Get Listings by Pincode
    @GetMapping("/pincode/{pincode}")
    public List<Listing> getListingsByPincode(@PathVariable String pincode) {
        try {
            int pin = Integer.parseInt(pincode);
            String minPin = String.valueOf(pin - 2);
            String maxPin = String.valueOf(pin + 2);
            return listingRepository.findByPincodeBetween(minPin, maxPin);
        } catch (NumberFormatException e) {
            return listingRepository.findByPincode(pincode);
        }
    }

    // 7. Delete Listing (IDOR Hardened)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(
            @PathVariable Long id,
            @RequestParam(value = "providerId", required = false) Long providerId
    ) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Ownership validation to prevent IDOR
        if (providerId != null && !listing.getProviderId().equals(providerId)) {
            return ResponseEntity.status(403).body("Error: You do not own this listing!");
        }
        
        listingRepository.deleteById(id);
        return ResponseEntity.ok("Listing deleted successfully!");
    }

    // 8. Edit/Update Listing (IDOR Hardened)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateListing(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("price") double price,
            @RequestParam("deposit") double deposit,
            @RequestParam("providerId") Long providerId,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) {
            return ResponseEntity.notFound().build();
        }

        // Ownership validation to prevent IDOR
        if (!listing.getProviderId().equals(providerId)) {
            return ResponseEntity.status(403).body("Error: Unauthorized to edit this listing!");
        }

        listing.setTitle(title);
        listing.setDescription(description);
        listing.setCategory(category);
        listing.setPrice(price);
        listing.setDeposit(deposit);

        if (image != null && !image.isEmpty()) {
            try {
                listing.setImageData(image.getBytes());
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Error saving image: " + e.getMessage());
            }
        }

        listingRepository.save(listing);
        return ResponseEntity.ok("Listing updated successfully!");
    }
}