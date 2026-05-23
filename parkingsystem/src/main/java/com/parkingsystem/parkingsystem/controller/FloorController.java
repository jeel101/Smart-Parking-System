package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.entity.Floor;
import com.parkingsystem.parkingsystem.entity.ParkingLot;
import com.parkingsystem.parkingsystem.service.IFloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/floor")
@RequiredArgsConstructor
public class FloorController {
    private final IFloorService iFloorService;

    @PostMapping("/create-floor/{parkingLotId}")
    public ResponseEntity<String> createFloor(@PathVariable Long parkingLotId) {
        iFloorService.addFloor(parkingLotId);
        return ResponseEntity.status(HttpStatus.CREATED).body("Floor is created");
    }

    @GetMapping("/{parkingLotId}/count")
    public ResponseEntity<Integer> getFloorCount(@PathVariable Long parkingLotId) {
        return ResponseEntity.ok(iFloorService.getFloorCount(parkingLotId));
    }

    @GetMapping("/parking-lot/{parkingLotId}")
    public ResponseEntity<List<Floor>> getFloors(@PathVariable Long parkingLotId) {
        return ResponseEntity.ok().body(iFloorService.getFloors(parkingLotId));
    }
}
