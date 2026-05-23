package com.parkingsystem.parkingsystem.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SlotParkingRequestDto {
    private Long slotId;
    private String vehicleNumber;
    private String vehicleType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String bookingType;
}
