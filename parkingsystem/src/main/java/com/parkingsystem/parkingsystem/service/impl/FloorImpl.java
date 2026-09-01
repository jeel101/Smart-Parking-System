 package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.entity.Floor;
import com.parkingsystem.parkingsystem.entity.ParkingLot;
import com.parkingsystem.parkingsystem.repository.FloorRepository;
import com.parkingsystem.parkingsystem.repository.ParkingLotRepository;
import com.parkingsystem.parkingsystem.service.IFloorService;
import com.parkingsystem.parkingsystem.service.ISlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FloorImpl implements IFloorService {
    private final FloorRepository floorRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final ISlotService iSlotService;

    @Override
    public Floor addFloor(Long parkingLotId) {
        //    get parking lot
        ParkingLot lot = parkingLotRepository.findById(parkingLotId).
                orElseThrow(() -> new RuntimeException("Parking lot not found"));

//    counting floors
        int floorCount = floorRepository.countByParkingLot(lot);
        //creating floors
        Floor floor = new Floor();
        floor.setFloorNum(floorCount + 1);
        floor.setParkingLot(lot);

        return floorRepository.save(floor);
    }

    @Override
    public int getFloorCount(Long parkingLotId) {
        ParkingLot lot = parkingLotRepository.findById(parkingLotId).
                orElseThrow(() -> new RuntimeException("Parking lot not found"));
        return floorRepository.countByParkingLot(lot);
    }

    @Override
    public List<Floor> getFloors(Long parkingLotId) {
        return floorRepository.findByParkingLot_Id(parkingLotId);
    }

    @Transactional
    @Override
    public void createParkingSetup(Long parkingLotId, int totalFloors, int slotsPerFloor) {
        for (int i=0; i<totalFloors; i++) {
            Floor floor = addFloor(parkingLotId);
            iSlotService.createSlots(floor.getId(), slotsPerFloor);
        }
    }
}
