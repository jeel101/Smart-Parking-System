package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.dto.PaymentOrderResponseDto;
import com.parkingsystem.parkingsystem.dto.PaymentVerificationDto;
import com.parkingsystem.parkingsystem.entity.Ticket;
import com.parkingsystem.parkingsystem.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
public class PaymentController {
    private final IPaymentService iPaymentService;

    @PostMapping("/create-order/{bookingId}")
    public ResponseEntity<PaymentOrderResponseDto> createOrder(@PathVariable Long bookingId) {
        return ResponseEntity.ok(iPaymentService.createPaymentOrder(bookingId));
    }

    @PostMapping("/verify")
    public ResponseEntity<Ticket> verifyPayment(@RequestBody PaymentVerificationDto request) {
        Ticket ticket = iPaymentService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        return ResponseEntity.ok(ticket);
    }
}
