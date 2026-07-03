package com.nearshare.api.repository;

import com.nearshare.api.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    // Fetch all transactions for a user, sorted by newest first
    List<WalletTransaction> findByUserIdOrderByTimestampDesc(Long userId);
}