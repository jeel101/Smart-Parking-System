package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.dto.SlotAvailabilityDto;
import com.parkingsystem.parkingsystem.entity.*;
import com.parkingsystem.parkingsystem.repository.BookingRepository;
import com.parkingsystem.parkingsystem.repository.FloorRepository;
import com.parkingsystem.parkingsystem.repository.SlotRepository;
import com.parkingsystem.parkingsystem.repository.TicketRepository;
import com.parkingsystem.parkingsystem.service.ISlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SlotImpl implements ISlotService{
    private final SlotRepository slotRepository;
    private final FloorRepository floorRepository;
    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    @Override
    public List<Slot> createSlots(Long floorId, int totalSlots) {
        Floor floor = floorRepository.findById(floorId).
                orElseThrow(() -> new RuntimeException("Floor not found"));

        int existingSlots = slotRepository.countByFloor_Id(floorId);
        List<Slot> slots = new ArrayList<>();


        for(int i=0; i<totalSlots; i++) {
            Slot slot = new Slot();
            slot.setFloor(floor);
            slot.setSlotStatus(SlotStatus.AVAILABLE);

            // assign slot number
            int slotNumber = existingSlots + i + 1;
            slot.setSlotNum("F" + floor.getFloorNum() + "-S" + slotNumber);

            // assign type
            if (slotNumber == 1) {
                slot.setSlotType(VehicleType.TRUCK);
            } else if (slotNumber == 2 || slotNumber == 3) {
                slot.setSlotType(VehicleType.BIKE);
            } else {
                slot.setSlotType(VehicleType.CAR);
            }
            slots.add(slot);
        }
        return slotRepository.saveAll(slots);
    }

    @Override
    public int countAllSlots(Long parkingLotId) {
        return slotRepository.countByFloor_ParkingLot_Id(parkingLotId);
    }

    @Override
    public int countSlotsOfFloor(Long floorId) {
        return slotRepository.countByFloor_Id(floorId);
    }


    @Override
    public List<Slot> getAllSlotsWithinFloor(Long floorId) {
        return slotRepository.findByFloor_Id(floorId);
    }

    @Override
    public List<Floor> getFloorsByParkingLot(Long parkingLotId) {
        return floorRepository.findByParkingLot_Id(parkingLotId);
    }

    @Override
    public int countAvailableSlots(Long floorId) {
        return slotRepository.countByFloor_Id_AndSlotStatus(
                floorId, SlotStatus.AVAILABLE);
    }

    @Override
    @Cacheable(value = "slotAvailability",
                key = "#floorId + ' ' + #startTime + '_' + #endTime")
    public List<SlotAvailabilityDto> getAvailableSlots(Long floorId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Slot> allSlots = slotRepository.findByFloor_Id(floorId);
        List<SlotAvailabilityDto> result = new ArrayList<>();

        for (Slot slot : allSlots) {
            Optional<Ticket> overlappingticket =ticketRepository.findOverlappingTicket(slot, endTime, startTime);

            System.out.println("REQUEST:");
            System.out.println(startTime);
            System.out.println(endTime);

            System.out.println("FOUND = " + overlappingticket.isPresent());

            if (overlappingticket.isPresent()) {
                Ticket ticket = overlappingticket.get();
                System.out.println("SLOT = " + slot.getSlotNum() +
                        "TYPE = " + ticket.getReservationType() +
                        "ENTRY = " + ticket.getEntryTime() +
                        "EXIT = " + ticket.getExitTime());
                if (ticket.getReservationType() == ReservationType.INSTANT) {
                    result.add(mapToDto(slot, false, "OCCUPIED"));
               }
                else {
                    result.add(mapToDto(slot, false, "RESERVED"));
                }
                continue;
            }
            // NEW: someone else's payment is currently in progress for this slot/window —
            // this is the "temporarily reserved for payment" behavior from your diagram.
            // Because this whole method is @Cacheable, this only matters for cache MISSES —
            // BookingImpl's @CacheEvict(allEntries = true) on initiateBooking/confirmBooking/
            // expireStaleBookings is what forces a fresh check to actually happen.
            boolean hasActiveHold = !bookingRepository.findActiveOverlapping(slot, endTime, startTime).isEmpty();

            if(hasActiveHold) {
                result.add(mapToDto(slot, false, "RESERVED"));
                continue;
            }
            result.add(mapToDto(slot, true, "AVAILABLE"));
        }
        System.out.println("DB HIT FOR SLOT SEARCH");

        return result;
    }

    private SlotAvailabilityDto mapToDto(Slot slot, boolean available, String reason) {
        SlotAvailabilityDto dto = new SlotAvailabilityDto();
        dto.setSlotId(slot.getSlotId());
        dto.setSlotNum(slot.getSlotNum());
        dto.setSlotType(slot.getSlotType());
        dto.setAvailable(available);
        dto.setReason(reason);
        return dto;
    }
}
