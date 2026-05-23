package com.parkingsystem.parkingsystem.repository;

import com.parkingsystem.parkingsystem.entity.Floor;
import com.parkingsystem.parkingsystem.entity.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    int countByParkingLot(ParkingLot parkingLot);
    List<Floor> findByParkingLot_Id(Long parkingLotId);
}
