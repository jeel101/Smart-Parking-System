package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.entity.ParkingLot;
import com.parkingsystem.parkingsystem.repository.ParkingLotRepository;
import com.parkingsystem.parkingsystem.service.IParkingLotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParkingLotImpl implements IParkingLotService{
    private final ParkingLotRepository parkingLotRepository;
    @Override
    public ParkingLot createParkingLot(ParkingLot lot) {
        return parkingLotRepository.save(lot);
    }

    @Override
    public List<ParkingLot> getAllLots() {
        return parkingLotRepository.findAll();
    }
}
