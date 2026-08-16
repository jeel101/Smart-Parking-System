package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.dto.PaymentOrderResponseDto;
import com.parkingsystem.parkingsystem.dto.PaymentVerificationDto;
import com.parkingsystem.parkingsystem.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
public class PaymentController {
    private final IPaymentService iPaymentService;

    @PostMapping("/create-order/{ticketId}")
    public ResponseEntity<PaymentOrderResponseDto> createOrder(@PathVariable Long ticketId) {
        return ResponseEntity.ok(iPaymentService.createPaymentOrder(ticketId));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody PaymentVerificationDto request) {
        iPaymentService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        return ResponseEntity.ok("Payment verified successfully");
    }
}
