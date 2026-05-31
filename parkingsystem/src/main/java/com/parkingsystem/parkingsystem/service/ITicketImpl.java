package com.parkingsystem.parkingsystem.service;


import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.entity.TicketStatus;

import java.util.List;

public interface ITicketImpl{
    List<TicketDto> getAllTickets(TicketStatus status);
}
