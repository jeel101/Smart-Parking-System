package com.parkingsystem.parkingsystem.service;


import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.entity.TicketStatus;

import java.util.List;

public interface ITicketService {
    List<TicketDto> getAllTickets(TicketStatus status);
}
