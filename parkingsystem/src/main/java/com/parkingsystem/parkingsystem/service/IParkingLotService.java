package com.parkingsystem.parkingsystem.service;

import com.parkingsystem.parkingsystem.entity.ParkingLot;

import java.util.List;

public interface IParkingLotService {
    ParkingLot createParkingLot(ParkingLot lot);
    List<ParkingLot> getAllLots();
}
