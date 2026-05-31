package com.parkingsystem.parkingsystem.service;


import com.parkingsystem.parkingsystem.dto.TicketDto;

import java.util.List;

public interface ITicketImpl{
    List<TicketDto> getAllTickets();
}
