package com.parkingsystem.parkingsystem.controller;

import com.parkingsystem.parkingsystem.entity.VehicleType;
import com.parkingsystem.parkingsystem.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("queue")
public class QueueController {
    private final QueueService queueService;

    @GetMapping("/size/{vehicleType}")
    public ResponseEntity<Long> getQueueSize(@PathVariable VehicleType vehicleType) {
        return ResponseEntity.ok(queueService.getQueuesize(vehicleType));
    }

    @GetMapping("/{type}")
    public ResponseEntity<List<Object>> getQueue(@PathVariable VehicleType type) {
        return ResponseEntity.ok(queueService.getQueue(type));
    }
}
