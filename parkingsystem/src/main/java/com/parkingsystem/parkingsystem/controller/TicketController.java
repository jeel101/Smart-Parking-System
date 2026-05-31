package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.repository.TicketRepository;
import com.parkingsystem.parkingsystem.service.ITicketImpl;
import com.parkingsystem.parkingsystem.service.impl.TicketImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ticket")
public class TicketController{
    private final ITicketImpl iTicket;
    @GetMapping("get-ticket")
    public ResponseEntity<List<TicketDto>> getAllTickets() {
        return ResponseEntity.ok(iTicket.getAllTickets());
    }
}
