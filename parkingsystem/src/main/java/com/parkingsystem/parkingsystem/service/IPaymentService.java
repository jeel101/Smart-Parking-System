package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.dto.PaymentOrderResponseDto;

public interface IPaymentService {
    PaymentOrderResponseDto createPaymentOrder (Long ticketId);

    void verifyPayment (String razorpayOrderId, String razorpayPaymentId, String razorpaySignature);
}
