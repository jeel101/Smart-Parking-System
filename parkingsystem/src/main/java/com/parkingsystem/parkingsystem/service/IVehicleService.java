package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.dto.SlotParkingRequestDto;
import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.dto.TicketRequestDto;
import com.parkingsystem.parkingsystem.entity.Ticket;

public interface IVehicleService {
    TicketDto parkVehicle(TicketRequestDto request);
    TicketDto parkBySelectedSlot(SlotParkingRequestDto request);
     String unparkVehicle(String ticketNumber);
     String confirmExit(Ticket ticket);
}
