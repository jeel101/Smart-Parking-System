package com.parkingsystem.parkingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BookingInitialResponseDto {
    private Long bookingId;
    private double amount;
}
