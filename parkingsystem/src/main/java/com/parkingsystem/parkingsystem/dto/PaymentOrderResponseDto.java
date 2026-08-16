package com.parkingsystem.parkingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentOrderResponseDto {
    private String orderId;
    private String keyId;
    private Long amount;
    private String currency;
}
