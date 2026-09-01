package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.dto.SlotAvailabilityDto;
import com.parkingsystem.parkingsystem.entity.Floor;
import com.parkingsystem.parkingsystem.entity.Slot;
import com.parkingsystem.parkingsystem.service.ISlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/slot")
public class SlotController {
    private final ISlotService iSlotService;
    //count of all slots within parking lot
    @GetMapping("/parking-lot/{parkingLotId}/count")
    public ResponseEntity<Integer> getCountOfAllSlots(@PathVariable Long parkingLotId) {
        return ResponseEntity.ok(iSlotService.countAllSlots(parkingLotId));
    }
    //count of all slots within floor
    @GetMapping("/floor/{floorId}/count")
    public ResponseEntity<Integer> getCountOfSlotsWithinFloor(@PathVariable Long floorId) {
        return ResponseEntity.ok(iSlotService.countSlotsOfFloor(floorId));
    }

    //all Slots within floor
    @GetMapping("/floor/{floorId}")
    public ResponseEntity<List<Slot>> getAllSlots(@PathVariable Long floorId) {
        List<Slot> slot = iSlotService.getAllSlotsWithinFloor(floorId);
        return ResponseEntity.ok().body(slot);
    }

    //get all floors within a parkinglot
    @GetMapping("/parking-lot/{parkingLotId}")
    public ResponseEntity<List<Floor>> getFloors(@PathVariable Long parkingLotId) {
        return ResponseEntity.ok(
                iSlotService.getFloorsByParkingLot(parkingLotId)
        );
    }

    //count of all available slots within floor
    @GetMapping("/floor/{floorId}/available/count")
    public ResponseEntity<Integer> getCountOfAvailableSlot(@PathVariable Long floorId) {
        return ResponseEntity.ok(iSlotService.countAvailableSlots(floorId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<SlotAvailabilityDto>> getAvailableSlots(@RequestParam Long floorId,
                                                                       @RequestParam LocalDateTime startTime,
                                                                       @RequestParam LocalDateTime endTime) {
        return ResponseEntity.ok(iSlotService.getAvailableSlots(floorId, startTime, endTime));
    }
}
