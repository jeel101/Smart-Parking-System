package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.dto.SlotAvailabilityDto;
import com.parkingsystem.parkingsystem.entity.Floor;
import com.parkingsystem.parkingsystem.entity.Slot;

import java.time.LocalDateTime;
import java.util.List;

public interface ISlotService {
    List<Slot> createSlots(Long floorId, int totalSlots);
    int countAllSlots(Long parkingLotId);
    int countSlotsOfFloor(Long floorId);
    List<Slot> getAllSlotsWithinFloor(Long floorId);
    List<Floor> getFloorsByParkingLot(Long parkingLotId);
    int countAvailableSlots(Long floorId);
    List<SlotAvailabilityDto> getAvailableSlots(Long floorId, LocalDateTime startTime, LocalDateTime endTime);
}
