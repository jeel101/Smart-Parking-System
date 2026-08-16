package com.parkingsystem.parkingsystem.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentVerificationDto {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
