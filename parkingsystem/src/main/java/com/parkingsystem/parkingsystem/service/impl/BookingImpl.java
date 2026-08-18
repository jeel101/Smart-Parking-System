package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.dto.BookingInitialResponseDto;
import com.parkingsystem.parkingsystem.dto.SlotParkingRequestDto;
import com.parkingsystem.parkingsystem.entity.*;
import com.parkingsystem.parkingsystem.repository.BookingRepository;
import com.parkingsystem.parkingsystem.repository.SlotRepository;
import com.parkingsystem.parkingsystem.repository.TicketRepository;
import com.parkingsystem.parkingsystem.repository.VehicleRepository;
import com.parkingsystem.parkingsystem.service.IBookingService;
import com.parkingsystem.parkingsystem.util.TicketPricingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingImpl implements IBookingService {
    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final TicketRepository ticketRepository;
    private final VehicleRepository vehicleRepository;
    private final TicketPricingUtil ticketPricingUtil;

    // how long a payment hold is valid before the slot is released back
    private static final long HOLD_MINUTES = 10;

    @Override
    @Transactional
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public BookingInitialResponseDto initialBooking(SlotParkingRequestDto request) {
        Slot slot = slotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        LocalDateTime start = request.getStartTime();
        LocalDateTime end = request.getEndTime();

        // validate dates only for reservation
        if(start.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Start time must be future");
        }
        if (end.isBefore(start)) {
            throw new RuntimeException("End time must be after start time");
        }

        // Same guards parkVehicleandCreateTicket runs — only relevant if this
        // vehicle number already exists. Vehicle creation itself still waits
        // until confirmBooking() (payment success), same as before.
        vehicleRepository.findByVehicleNumber(request.getVehicleNumber()).ifPresent(vehicle -> {
            if (vehicle.getVehicleType() != slot.getSlotType()) {
                throw new RuntimeException("Vehicle type does not match slot type");
            }
            if (ticketRepository.existsByVehicleAndStatus(vehicle, TicketStatus.OPEN)) {
                throw new RuntimeException("Vehicle already parked");
            }
        });

        // conflict against confirmed tickets (existing reservations)
        boolean ticketConflict = ticketRepository.existsOverlappingReservation(slot, end, start);
        if (ticketConflict) {
            throw new RuntimeException("Slot already booked for selected time");
        }

        // conflict against another payment currently in progress for this slot/window
        List<Booking> activeHolds = bookingRepository.findActiveOverlapping(slot, end, start);
            if(!activeHolds.isEmpty()) {
                throw new RuntimeException("Slot temporarily reserved for payment — try again in a few minutes or pick another slot");
            }

        double amount = ticketPricingUtil.calculateAmount(slot.getSlotType(), ticketPricingUtil.billableHours(start, end));

        Booking booking = new Booking();
        booking.setSlot(slot);
        booking.setVehicleNumber(request.getVehicleNumber());
        booking.setVehicleType(slot.getSlotType());
        booking.setReservationType(ReservationType.valueOf(request.getBookingType()));
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setAmount(amount);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setExpiresAt(LocalDateTime.now().plusMinutes(HOLD_MINUTES));

        Booking saved = bookingRepository.save(booking);

        // transaction (and the pessimistic lock with it) ends here —
        // the Razorpay order is created in a separate call after this returns.
        return new BookingInitialResponseDto(saved.getId(), saved.getAmount());
    }

    @Override
    @Transactional
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public Ticket confirmBooking(Booking booking) {
        // find or create vehicle first
        Vehicle vehicle = vehicleRepository.findByVehicleNumber(booking.getVehicleNumber())
                .orElseGet(() -> {
                    Vehicle v = new Vehicle();
                    v.setVehicleNumber(booking.getVehicleNumber());
                    v.setVehicleType(booking.getVehicleType());
                    return vehicleRepository.save(v);
                });

        long hours = ticketPricingUtil.billableHours(booking.getStartTime(), booking.getEndTime());

        //create ticket
        Ticket ticket = new Ticket();
        ticket.setTicketNumber(ticketPricingUtil.generateTicketNumber());
        ticket.setSlot(booking.getSlot());
        ticket.setVehicle(vehicle);
        ticket.setReservationType(booking.getReservationType());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setEntryTime(booking.getStartTime());
        ticket.setExitTime(booking.getEndTime());
        ticket.setDuration(hours);
        ticket.setPrice(booking.getAmount());

        Ticket saved = ticketRepository.save(ticket);
        booking.setStatus(BookingStatus.PAID);
        bookingRepository.save(booking);

        return saved;
    }

    // Same 60s cadence as your existing autoCloseExpiredReservations scheduler.
    // Evicts the availability cache every run, same as your park/unpark methods do —
    // slightly wasteful if nothing actually expired that minute, but consistent
    // with the pattern already in VehicleImpl rather than a new special case.
    @Transactional
    @CacheEvict(value = "slotAvailability", allEntries = true)
    @Scheduled(fixedRate = 60000)
    public void expireStaleBookings() {
        List<Booking> stale = bookingRepository.findAllByStatusAndExpiresAtBefore(
                BookingStatus.PENDING_PAYMENT, LocalDateTime.now());

        for(Booking booking: stale) {
            booking.setStatus(BookingStatus.EXPIRED);
        }
    }
}
