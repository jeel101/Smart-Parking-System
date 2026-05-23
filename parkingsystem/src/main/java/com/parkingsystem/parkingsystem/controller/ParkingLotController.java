package com.parkingsystem.parkingsystem.controller;
import com.parkingsystem.parkingsystem.entity.ParkingLot;
import com.parkingsystem.parkingsystem.service.IParkingLotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parking-lot")
@RequiredArgsConstructor
public class ParkingLotController {
    private final IParkingLotService iParkingLotService;

    @PostMapping
    public ResponseEntity<ParkingLot> createParkingLot(@RequestBody  ParkingLot lot) {
        return ResponseEntity.status(HttpStatus.CREATED).body(iParkingLotService.createParkingLot(lot));
    }

    @GetMapping
    public ResponseEntity<List<ParkingLot>> getAllLots() {
        return ResponseEntity.ok(iParkingLotService.getAllLots());
    }
}
