package com.parkingsystem.parkingsystem.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketDto {
    private String ticketNumber;
    private String vehicleNumber;
    private String vehicleType;
    private String slotNumber;
    private String reservationType;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Long duration;
    private double price;
    private String status;
}
