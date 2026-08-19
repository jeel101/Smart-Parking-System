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

    // NEW — every payment now starts against a Booking (the hold), not a Ticket,
    // since the Ticket doesn't exist until the payment actually succeeds.
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // CHANGED — was nullable = false. Must be optional now: this stays null
    // from order-creation until verifyPayment() succeeds and creates the ticket.
    @OneToOne
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;
}
