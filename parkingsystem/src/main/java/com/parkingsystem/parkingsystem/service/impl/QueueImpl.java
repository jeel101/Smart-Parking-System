package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.entity.Vehicle;
import com.parkingsystem.parkingsystem.entity.VehicleType;
import com.parkingsystem.parkingsystem.service.QueueService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

@Service
public class QueueImpl implements QueueService {
   private final Map<VehicleType, Queue<Vehicle>> queueMap = new HashMap<>();

   public QueueImpl() {
       queueMap.put(VehicleType.CAR, new LinkedList<>());
       queueMap.put(VehicleType.BIKE, new LinkedList<>());
       queueMap.put(VehicleType.TRUCK, new LinkedList<>());
   }

    @Override
    public void addToQueue(Vehicle vehicle) {
        queueMap.get(vehicle.getVehicleType()).add(vehicle);
    }

    @Override
    public Vehicle getNext(VehicleType type) {
        return queueMap.get(type).poll();
    }
}
