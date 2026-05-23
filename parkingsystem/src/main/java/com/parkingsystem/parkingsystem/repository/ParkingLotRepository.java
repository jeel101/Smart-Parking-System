package com.parkingsystem.parkingsystem.repository;

import com.parkingsystem.parkingsystem.entity.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long>{
}
