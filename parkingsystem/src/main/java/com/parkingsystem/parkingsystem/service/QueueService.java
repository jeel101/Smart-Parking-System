package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.entity.Vehicle;
import com.parkingsystem.parkingsystem.entity.VehicleType;

import java.util.List;

public interface QueueService {
    void addToQueue(Vehicle vehicle);
    Vehicle getNext(VehicleType type);
    Long getQueuesize(VehicleType type);
    List<Object> getQueue(VehicleType type);
}
