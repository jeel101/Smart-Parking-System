package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.dto.BookingInitialResponseDto;
import com.parkingsystem.parkingsystem.dto.SlotParkingRequestDto;
import com.parkingsystem.parkingsystem.service.IBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/booking")
public class BookingController {
    private final IBookingService iBookingService;

    @PostMapping("/initiate")
    public ResponseEntity<BookingInitialResponseDto> initiate(@RequestBody SlotParkingRequestDto request) {
        return ResponseEntity.ok(iBookingService.initialBooking(request));
    }
}
