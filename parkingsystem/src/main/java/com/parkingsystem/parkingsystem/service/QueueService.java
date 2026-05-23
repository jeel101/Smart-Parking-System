package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.entity.Vehicle;
import com.parkingsystem.parkingsystem.entity.VehicleType;

public interface QueueService {
    void addToQueue(Vehicle vehicle);
    Vehicle getNext(VehicleType type);
}
