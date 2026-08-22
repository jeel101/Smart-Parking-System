package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.dto.SlotParkingRequestDto;
import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.dto.TicketRequestDto;
import com.parkingsystem.parkingsystem.entity.Ticket;

import java.time.LocalDateTime;

public interface IVehicleService {
    TicketDto parkVehicle(TicketRequestDto request);
    TicketDto parkBySelectedSlot(SlotParkingRequestDto request);
     String unparkVehicle(String ticketNumber);
     String confirmExit(Ticket ticket, LocalDateTime lockedExitTime, Double lockedAmount);
}
