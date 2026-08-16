package com.parkingsystem.parkingsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    @OneToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
}
