package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.entity.TicketStatus;
import com.parkingsystem.parkingsystem.service.ITicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ticket")
public class TicketController{
    private final ITicketService iTicket;
    @GetMapping("get-ticket/{status}")
    public ResponseEntity<List<TicketDto>> getAllTickets(@PathVariable TicketStatus status) {
        return ResponseEntity.ok(iTicket.getAllTickets(status));
    }
}
