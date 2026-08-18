package com.parkingsystem.parkingsystem.repository;

import com.parkingsystem.parkingsystem.entity.Booking;
import com.parkingsystem.parkingsystem.entity.BookingStatus;
import com.parkingsystem.parkingsystem.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("select b from Booking b where b.slot = :slot " + "AND b.status = 'PENDING_PAYMENT' " +
            "AND b.expiresAt > CURRENT_TIMESTAMP " +
            "AND b.startTime < :endTime AND b.endTime > :startTime "
            )
    List<Booking> findActiveOverlapping(@Param("slot") Slot slot, @Param("endTime") LocalDateTime endTime,
                                        @Param("startTime") LocalDateTime startTime);

    List<Booking> findAllByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime time);
}
