package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.dto.BookingInitialResponseDto;
import com.parkingsystem.parkingsystem.dto.SlotParkingRequestDto;
import com.parkingsystem.parkingsystem.entity.Booking;
import com.parkingsystem.parkingsystem.entity.Ticket;

public interface IBookingService {
    BookingInitialResponseDto initialBooking(SlotParkingRequestDto request);

    // returns the entity (not a DTO) so PaymentImpl can link Payment.ticket to it
    Ticket confirmBooking(Booking booking);

}
