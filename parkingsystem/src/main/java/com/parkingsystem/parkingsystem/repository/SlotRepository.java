package com.parkingsystem.parkingsystem.repository;

import com.parkingsystem.parkingsystem.entity.Slot;
import com.parkingsystem.parkingsystem.entity.SlotStatus;
import com.parkingsystem.parkingsystem.entity.VehicleType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    int countByFloor_Id(Long floorId);
    int countByFloor_ParkingLot_Id(Long parkingLotId);
    int countByFloor_Id_AndSlotStatus(Long floorId, SlotStatus status);
    List<Slot> findByFloor_ParkingLot_Id_AndSlotTypeIn(Long parkingLotId, List<VehicleType> types);
    List<Slot> findByFloor_Id(Long floorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select s from Slot s where s.slotId = :slotId
            """)
    Optional<Slot> findByIdWithLock(@Param("slotId") Long slotId);
}
