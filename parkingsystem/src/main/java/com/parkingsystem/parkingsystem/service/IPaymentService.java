package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.dto.PaymentOrderResponseDto;
import com.parkingsystem.parkingsystem.entity.Ticket;

public interface IPaymentService {
    PaymentOrderResponseDto createPaymentOrder (Long bookingId);

    Ticket verifyPayment (String razorpayOrderId, String razorpayPaymentId, String razorpaySignature);
}
