package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.dto.SlotParkingRequestDto;
import com.parkingsystem.parkingsystem.dto.TicketDto;
import com.parkingsystem.parkingsystem.dto.TicketRequestDto;
import com.parkingsystem.parkingsystem.entity.*;
import com.parkingsystem.parkingsystem.repository.SlotRepository;
import com.parkingsystem.parkingsystem.repository.TicketRepository;
import com.parkingsystem.parkingsystem.repository.VehicleRepository;
import com.parkingsystem.parkingsystem.service.IVehicleService;
import com.parkingsystem.parkingsystem.service.QueueService;
import com.parkingsystem.parkingsystem.util.TicketPricingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleImpl implements IVehicleService {
    private final VehicleRepository vehicleRepository;
    private final SlotRepository slotRepository;
    private final TicketRepository ticketRepository;
    private final QueueService queueService;
    private final TicketPricingUtil ticketPricingUtil;
    @Override
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public TicketDto parkVehicle(TicketRequestDto request) {
        // Reservations (DAILY/WEEKLY/MONTHLY) must go through /booking/initiate
        // so they're payment-gated. This endpoint only ever hands out an
        // immediate, unpaid-at-entry INSTANT ticket.
        if(!"INSTANT".equals(request.getBookingType())) {
            throw new RuntimeException("Reservations must be booked through the payment flow, not this endpoint");
        }

        VehicleType type = VehicleType.valueOf(request.getVehicleType());

        List<VehicleType> allowedTypes = getAllowedTypes(type);

        List<Slot> slot = slotRepository.findByFloor_ParkingLot_Id_AndSlotTypeIn(1L, allowedTypes);

        // find or create vehicle first
        Vehicle vehicle = vehicleRepository
                        .findByVehicleNumber(request.getVehicleNumber()).orElseGet(() -> {
                            Vehicle v = new Vehicle();
                            v.setVehicleNumber(request.getVehicleNumber());
                            v.setVehicleType(type);
                            return vehicleRepository.save(v);
                        });

        //filter vehicles
//        List<Slot> availableSots = slot.stream().filter(slots -> {
//            LocalDateTime startTime;
//            LocalDateTime endTime;
//
//            if(request.getBookingType().equals("INSTANT")) {
//                startTime = LocalDateTime.now();
//                endTime = LocalDateTime.now().plusHours(12);
//            }else {
//                startTime = request.getStartTime();
//                endTime = request.getEndTime();
//            }
//            return ticketRepository.findOverlappingTicket(slots,endTime, startTime).isEmpty();
//        }).collect(java.util.stream.Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusHours(12);

        List<Slot> availableSots = slot.stream().filter(
                s -> ticketRepository.findOverlappingTicket(s, windowEnd, now).isEmpty()).collect(Collectors.toList()
        );

        if(availableSots.isEmpty()) {
            queueService.addToQueue(vehicle);
            throw new RuntimeException("Parking full. Added to waiting queue.");
        }

        //sorting for nearest slot
        availableSots.sort(Comparator.comparing((Slot s) -> s.getFloor().getFloorNum()).
                thenComparing(s -> Integer.parseInt(s.getSlotNum().split("S")[1])));

        Slot selectedSlot = availableSots.get(0);

        return parkVehicleandCreateTicket(vehicle, selectedSlot);
    }

    @Override
    @Transactional
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public TicketDto parkBySelectedSlot(SlotParkingRequestDto request) {
        if(!"INSTANT".equals(request.getBookingType())) {
            throw new RuntimeException("Reservations must be booked through the payment flow, not this endpoint");
        }

        Slot slot = slotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        System.out.println("LOCK ACQUIRED FOR SLOT: " + slot.getSlotNum());
        System.out.println("LOCK ACQUIRED BY THREAD: " + Thread.currentThread().getName());

        // find or create vehicle
        Vehicle vehicle =
                vehicleRepository.findByVehicleNumber(request.getVehicleNumber())
                        .orElseGet(() -> {
                            Vehicle v = new Vehicle();
                            v.setVehicleNumber(request.getVehicleNumber());
                            v.setVehicleType(slot.getSlotType());
                            return vehicleRepository.save(v);
                        });

        return parkVehicleandCreateTicket(vehicle, slot);
    }

    @Override
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public String unparkVehicle(String ticketNumber) {
        //find ticket
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // prevent double unpark
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Ticket already closed");
        }
        ticket.setExitTime(LocalDateTime.now());
        ticket.setStatus(TicketStatus.CLOSED);
        //free slot
        Slot slot = ticket.getSlot();
        slotRepository.save(slot);

        if (ticket.getReservationType() == ReservationType.INSTANT) {
            closeTicket(ticket);
        }
        //getting next vehicle from queue
        Vehicle nextVehicle = queueService.getNext(slot.getSlotType());

        if (nextVehicle != null) {
            System.out.println("Next vehicle in queue: " + nextVehicle.getVehicleNumber());
        }
        ticketRepository.save(ticket);

        return ("Ticket closed successfully" + ticket.getDuration() + " hours | Price: ₹" + ticket.getPrice());
    }

    private List<VehicleType> getAllowedTypes(VehicleType type) {
        if(type == VehicleType.BIKE) {
            return List.of(VehicleType.BIKE);
        }else if(type == VehicleType.CAR) {
            return List.of(VehicleType.CAR);
        }else if(type == VehicleType.TRUCK) {
            return List.of(VehicleType.TRUCK);
        }
        return List.of(type);
    }

    private void closeTicket(Ticket ticket) {
        long hours = ticketPricingUtil.billableHours(ticket.getEntryTime(), ticket.getExitTime());
        double price = ticketPricingUtil.calculateAmount(ticket.getVehicle().getVehicleType(), hours);
        ticket.setDuration(hours);
        ticket.setPrice(price);
        ticketRepository.save(ticket);
    }

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void autoCloseExpiredReservations() {
        List<Ticket> expiredTickets = ticketRepository.findAllByStatusAndExitTimeBefore(TicketStatus.OPEN, LocalDateTime.now());

        for(Ticket tickets: expiredTickets) {
            tickets.setStatus(TicketStatus.EXPIRED);
            ticketRepository.save(tickets);
            Slot slot = tickets.getSlot();

            if(tickets.getReservationType() == ReservationType.INSTANT) {
                slot.setSlotStatus(SlotStatus.AVAILABLE);
                closeTicket(tickets);
            }
            // no explicit save() needed inside a @Transactional method —
            // dirty checking flushes changes to managed entities automatically
//            slotRepository.save(slot);
            System.out.println("Ticket: " + tickets.getTicketNumber() + "has been expired and closed!");
        }
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

//    private String ticketGenerator() {
//        String ticketNumber = "TCKT-" + LocalDateTime.now().format(
//                DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
//        );
//        return ticketNumber;
//    }

    // Simplified: bookingType is now guaranteed INSTANT by the guards in
    // parkVehicle/parkBySelectedSlot, so all the reservation-branch logic
    // (date validation, duration/price-from-dates) that used to live here
    // is gone — it was never reachable through a paid path anyway.
    private TicketDto parkVehicleandCreateTicket(Vehicle vehicle, Slot slot)  {

        // prevent duplicate parking
        boolean alreadyParked = ticketRepository.existsByVehicleAndStatus(vehicle, TicketStatus.OPEN);

        if (alreadyParked) {
            throw new RuntimeException("Vehicle already parked");
        }

        //check for vehicle and slot type to be same
        if(vehicle.getVehicleType() !=slot.getSlotType()) {
            throw new RuntimeException("Vehicle type does not match slot type");
        }

        LocalDateTime entry = LocalDateTime.now();
        LocalDateTime exit = LocalDateTime.now().plusHours(12);


        // Guards a race between the availability check and this call —
        // still relevant for INSTANT even without the reservation logic.
        boolean overlapping = ticketRepository.existsOverlappingReservation(slot, exit, entry   );
        if(overlapping) {
            throw new RuntimeException("Slot already booked for selected time");
        }

        slotRepository.save(slot);

        // create ticket
        Ticket ticket = new Ticket();
        ticket.setTicketNumber(ticketPricingUtil.generateTicketNumber());
        ticket.setSlot(slot);
        ticket.setVehicle(vehicle);
        ticket.setReservationType(ReservationType.INSTANT);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setEntryTime(entry);
        ticket.setExitTime(exit);
        ticket.setDuration(0L);
        ticket.setPrice(0);

        Ticket saved = ticketRepository.save(ticket);

        return mapToTicketDto(saved);
    }
}
