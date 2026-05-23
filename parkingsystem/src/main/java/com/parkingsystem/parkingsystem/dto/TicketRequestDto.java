package com.parkingsystem.parkingsystem.dto;

import com.parkingsystem.parkingsystem.entity.ReservationType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketRequestDto {
    private String vehicleNumber;
    private String vehicleType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String bookingType;
}
