package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.entity.Vehicle;
import com.parkingsystem.parkingsystem.entity.VehicleType;
import com.parkingsystem.parkingsystem.repository.VehicleRepository;
import com.parkingsystem.parkingsystem.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QueueImpl implements QueueService {
   private final RedisTemplate<String, Object> redisTemplate;
   private final VehicleRepository vehicleRepository;

   private String getQueueKey(VehicleType type) {
       return type.name() + "_QUEUE";
   }

    @Override
    public void addToQueue(Vehicle vehicle) {
       redisTemplate.opsForList().rightPush(getQueueKey(vehicle.getVehicleType()), vehicle.getVehicleNumber());
    }

    @Override
    public Vehicle getNext(VehicleType type) {
       String vehicleNumber = (String) redisTemplate.opsForList().leftPop(getQueueKey(type));

       if(vehicleNumber == null) {
           return null;
       }

       return vehicleRepository.findByVehicleNumber(vehicleNumber).orElse(null);
    }

    public Long getQueuesize(VehicleType type) {
       return redisTemplate.opsForList().size(getQueueKey(type));
    }

    @Override
    public List<Object> getQueue(VehicleType type) {
        return redisTemplate.opsForList().range(getQueueKey(type), 0, -1);
    }
}
