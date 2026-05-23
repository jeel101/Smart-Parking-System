package com.parkingsystem.parkingsystem.service;


import com.parkingsystem.parkingsystem.entity.Floor;

import java.util.List;

public interface IFloorService {
    Floor addFloor(Long parkingLotId);
    int getFloorCount(Long parkingLotId);
    List<Floor> getFloors(Long parkingLotId);
}
