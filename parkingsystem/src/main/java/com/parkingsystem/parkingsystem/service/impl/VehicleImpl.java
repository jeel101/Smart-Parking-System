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

@Service
@RequiredArgsConstructor
public class VehicleImpl implements IVehicleService {
    private final VehicleRepository vehicleRepository;
    private final SlotRepository slotRepository;
    private final TicketRepository ticketRepository;
    private final QueueService queueService;
    @Override
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public TicketDto parkVehicle(TicketRequestDto request) {
        VehicleType type = VehicleType.valueOf(request.getVehicleType());

        List<VehicleType> allowedTypes = getAllowedTypes(type);

        List<Slot> slot = slotRepository.findByFloor_ParkingLot_Id_AndSlotTypeIn(1L, allowedTypes);

        // find or create vehicle first
        Vehicle vehicle = vehicleRepository
                        .findByVehicleNumber(request.getVehicleNumber())
                        .orElseGet(() -> {
                            Vehicle v = new Vehicle();
                            v.setVehicleNumber(
                                    request.getVehicleNumber()
                            );
                            v.setVehicleType(type);
                            return vehicleRepository.save(v);
                        });

        //filter vehicles
        List<Slot> availableSots = slot.stream().filter(slots -> {
            LocalDateTime startTime;
            LocalDateTime endTime;

            if(request.getBookingType().equals("INSTANT")) {
                startTime = LocalDateTime.now();
                endTime = LocalDateTime.now().plusHours(12);
            }else {
                startTime = request.getStartTime();
                endTime = request.getEndTime();
            }
            return ticketRepository.findOverlappingTicket(slots,endTime, startTime).isEmpty();
        }).collect(java.util.stream.Collectors.toList());

        if(availableSots.isEmpty()) {
            if(request.getBookingType().equals("INSTANT")) {
                queueService.addToQueue(vehicle);
                throw new RuntimeException("Parking full. Added to waiting queue.");
            }
            throw new RuntimeException("No slot available");
        }

        //sorting for nearest slot
        availableSots.sort(Comparator.comparing((Slot s) -> s.getFloor().getFloorNum()).
                thenComparing(s -> Integer.parseInt(s.getSlotNum().split("S")[1])));

        Slot selectedSlot = availableSots.get(0);

        return parkVehicleandCreateTicket(
                vehicle,
                request.getBookingType(),
                request.getStartTime(),
                request.getEndTime(),
                selectedSlot
        );
    }

    @Override
    @Transactional
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public TicketDto parkBySelectedSlot(SlotParkingRequestDto request) {

        Slot slot = slotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        System.out.println("LOCK ACQUIRED FOR SLOT: " + slot.getSlotNum());
        System.out.println("LOCK ACQUIRED BY THREAD: " + Thread.currentThread().getName());

        // find or create vehicle
        Vehicle vehicle =
                vehicleRepository
                        .findByVehicleNumber(
                                request.getVehicleNumber()
                        )
                        .orElseGet(() -> {
                            Vehicle v = new Vehicle();

                            v.setVehicleNumber(
                                    request.getVehicleNumber()
                            );
                            v.setVehicleType(
                                    slot.getSlotType()
                            );

                            return vehicleRepository.save(v);
                        });

        return parkVehicleandCreateTicket(
                vehicle,
                request.getBookingType(),
                request.getStartTime(),
                request.getEndTime(),
                slot
        );
    }

    @Override
    @CacheEvict(value = "slotAvailability", allEntries = true)
    public String unparkVehicle(String ticketNumber) {
        //find ticket
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber).orElseThrow(
                () -> new RuntimeException("Ticket not found")
        );

        // prevent double unpark
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Ticket already closed");
        }
        ticket.setExitTime(LocalDateTime.now());
        ticket.setStatus(TicketStatus.CLOSED);
        //free slot
        Slot slot = ticket.getSlot();
//        slot.setSlotStatus(SlotStatus.AVAILABLE);
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
        long hours = Duration.between(ticket.getEntryTime(),ticket.getExitTime()).toHours();

        // minimum 1 hour charge
        if (hours == 0) {
            hours = 1;
        }

        double price;

        switch (ticket.getVehicle().getVehicleType()) {
            case CAR -> price = hours * 20;
            case BIKE -> price = hours * 10;
            case TRUCK -> price = hours * 40;
            default -> price = hours * 20;
        }
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

    private String ticketGenerator() {
        String ticketNumber = "TCKT-" + LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        );
        return ticketNumber;
    }

    private TicketDto parkVehicleandCreateTicket(Vehicle vehicle,
                                                 String bookingType,
                                                 LocalDateTime startTime,
                                                 LocalDateTime endTime,
                                                 Slot slot)  {
        System.out.println("BOOKING TYPE = " + bookingType);
        System.out.println("START = " + startTime);
        System.out.println("END = " + endTime);

        // prevent duplicate parking
        boolean alreadyParked = ticketRepository.existsByVehicleAndStatus(vehicle, TicketStatus.OPEN);

        if (alreadyParked) {
            throw new RuntimeException("Vehicle already parked");
        }

        //check for vehicle and slot type to be same
        if(vehicle.getVehicleType() !=slot.getSlotType()) {
            throw new RuntimeException("Vehicle type does not match slot type");
        }

        // reservation check
        boolean instantBooking = bookingType.equals("INSTANT");

        LocalDateTime checkStart;
        LocalDateTime checkEnd;

        if(instantBooking) {
            checkStart = LocalDateTime.now();
            checkEnd = LocalDateTime.now().plusHours(12);
        }else {
            checkStart = startTime;
            checkEnd = endTime;
        }

        boolean overlapping = ticketRepository.existsOverlappingReservation(slot, checkEnd, checkStart);
        if(overlapping) {
            throw new RuntimeException("Slot already booked for selected time");
        }

        // validate dates only for reservation
        if (!instantBooking) {
            if (startTime.isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Start time must be future");
            }

            if (endTime.isBefore(startTime)) {
                throw new RuntimeException("End time must be after start time");
            }
        }



        slotRepository.save(slot);

        // create ticket
        Ticket ticket = new Ticket();
        ticket.setTicketNumber(ticketGenerator());
        ticket.setSlot(slot);
        ticket.setVehicle(vehicle);
        ticket.setReservationType(
                ReservationType.valueOf(bookingType)
        );
        ticket.setStatus(TicketStatus.OPEN);

        // reservation booking logic
        if (!instantBooking) {
            ticket.setEntryTime(startTime);
            ticket.setExitTime(endTime);

            long hours = Duration.between(
                    startTime,
                    endTime
            ).toHours();

            if (hours == 0) {
                hours = 1;
            }

            double price;

            switch (vehicle.getVehicleType()) {
                case CAR -> price = hours * 20;
                case BIKE -> price = hours * 10;
                case TRUCK -> price = hours * 40;
                default -> price = hours * 20;
            }

            ticket.setDuration(hours);
            ticket.setPrice(price);

        }

        // instant booking logic
        else {
            ticket.setEntryTime(LocalDateTime.now());
            ticket.setExitTime(LocalDateTime.now().plusHours(12));
            ticket.setPrice(0);
            ticket.setDuration(0L);
        }

        Ticket saved = ticketRepository.save(ticket);

        return mapToTicketDto(saved);
    }
}
