package com.parkingsystem.parkingsystem.repository;

import com.parkingsystem.parkingsystem.entity.Payment;
import com.parkingsystem.parkingsystem.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository  extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByTicket(Ticket ticket);
}
