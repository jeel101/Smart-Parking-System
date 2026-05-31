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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

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
    public TicketDto parkVehicle(TicketRequestDto request) {
        VehicleType type =
                VehicleType.valueOf(request.getVehicleType());

        List<VehicleType> allowedTypes =
                getAllowedTypes(type);

        List<Slot> slot = slotRepository.findByFloor_ParkingLot_Id_AndSlotTypeInAndSlotStatus(
                1L, allowedTypes,SlotStatus.AVAILABLE
        );

        // find or create vehicle first
        Vehicle vehicle =
                vehicleRepository
                        .findByVehicleNumber(request.getVehicleNumber())
                        .orElseGet(() -> {
                            Vehicle v = new Vehicle();
                            v.setVehicleNumber(
                                    request.getVehicleNumber()
                            );
                            v.setVehicleType(type);
                            return vehicleRepository.save(v);
                        });

        if(slot.isEmpty()) {
            queueService.addToQueue(vehicle);

            throw new RuntimeException("No slot available");
        }

        //sorting for nearest slot
        slot.sort(Comparator.comparing((Slot s) -> s.getFloor().getFloorNum()).
                thenComparing(s -> Integer.parseInt(s.getSlotNum().split("S")[1])));

        Slot slots = slot.get(0);

        return parkVehicleandCreateTicket(
                vehicle,
                request.getBookingType(),
                request.getStartTime(),
                request.getEndTime(),
                slots
        );
    }

    @Override
    public TicketDto parkBySelectedSlot(SlotParkingRequestDto request) {

        Slot slot = slotRepository.findById(
                request.getSlotId()
        ).orElseThrow(() ->
                new RuntimeException("Slot not found"));

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

    @Scheduled(fixedRate = 60000)
    public void autoCloseExpiredReservations() {
        List<Ticket> expiredTickets = ticketRepository.findAllByStatusAndExitTimeBefore(TicketStatus.OPEN, LocalDateTime.now());

        for(Ticket tickets: expiredTickets) {
            tickets.setStatus(TicketStatus.CLOSED);
            Slot slot = tickets.getSlot();

            if(tickets.getReservationType() == ReservationType.INSTANT) {
                slot.setSlotStatus(SlotStatus.AVAILABLE);
            }

            slotRepository.save(slot);
            ticketRepository.save(tickets);
            System.out.println("Ticket: " + tickets.getTicketNumber() + "has been expired and cloes!");
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
        // reservation check
        boolean isReservation = !bookingType.equals("INSTANT");

        if(isReservation) {
            boolean alreadyReserved = ticketRepository.existsOverlappingReservation(
                    slot, endTime, startTime
            );

            if(alreadyReserved) {
                throw new RuntimeException("Slot already reserved for selected dates");
            }
        }

        // validate dates only for reservation
        if (isReservation) {
            if (startTime.isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Start time must be future");
            }

            if (endTime.isBefore(startTime)) {
                throw new RuntimeException("End time must be after start time");
            }
        }

        // prevent duplicate parking
        boolean alreadyParked = ticketRepository.existsByVehicleAndStatus(vehicle, TicketStatus.OPEN);

        if (alreadyParked) {
            throw new RuntimeException("Vehicle already parked");
        }

        System.out.println("BOOKING TYPE = " + bookingType);
        System.out.println("IS RESERVATION = " + isReservation);
        System.out.println("SLOT ID = " + slot.getSlotId());
        System.out.println("SLOT STATUS = " + slot.getSlotStatus());

        // for instant booking only, slot must not be occupied
        if (!isReservation && slot.getSlotStatus() != SlotStatus.AVAILABLE) {
            throw new RuntimeException(
                    "Selected slot is occupied"
            );
        }

        // mark slot status
//        if (!isReservation) {
//            slot.setSlotStatus(SlotStatus.OCCUPIED);
//        }

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
        if (isReservation) {

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
