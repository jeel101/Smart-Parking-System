package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.dto.SlotParkingRequestDto;
import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.dto.TicketRequestDto;
import com.parkingsystem.parkingsystem.service.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vehicle")
public class VehicleController {
    private final IVehicleService iVehicleService;

    @PostMapping("/park")
    public ResponseEntity<TicketDto> parkVehicle(@RequestBody TicketRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED).
                body(iVehicleService.parkVehicle(request));
    }

    @PostMapping("/park-by-slot")
    public  ResponseEntity<TicketDto> parkBySlot(@RequestBody SlotParkingRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(iVehicleService.parkBySelectedSlot(request));
    }

    @PostMapping("/unpark/{ticketNumber}")
    public ResponseEntity<String> unparkVehicle(@PathVariable String ticketNumber) {
        return ResponseEntity.status(HttpStatus.CREATED).body(iVehicleService.unparkVehicle(ticketNumber));
    }

}
