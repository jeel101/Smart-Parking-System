package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.entity.Ticket;
import com.parkingsystem.parkingsystem.entity.TicketStatus;
import com.parkingsystem.parkingsystem.repository.TicketRepository;
import com.parkingsystem.parkingsystem.service.ITicketImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketImpl  implements ITicketImpl {
    private final TicketRepository ticketRepository;
    public List<TicketDto> getAllTickets() {
        return ticketRepository.findAllByStatus(TicketStatus.OPEN).stream().map(this::mapToTicketDto).toList();
    }

    private TicketDto mapToTicketDto(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setVehicleNumber(ticket.getVehicle().getVehicleNumber());
        dto.setVehicleType(ticket.getVehicle().getVehicleType().name());
        dto.setSlotNumber(ticket.getSlot().getSlotNum());
        dto.setReservationType(ticket.getReservationType().name());
        dto.setEntryTime(ticket.getEntryTime());
        dto.setExitTime(ticket.getExitTime());
        dto.setDuration(ticket.getDuration());
        dto.setPrice(ticket.getPrice());
        if (ticket.getStatus() != null) {
            dto.setStatus(ticket.getStatus().name());
        }
        return dto;
    }
}
