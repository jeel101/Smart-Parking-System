package com.parkingsystem.parkingsystem.repository;

import com.parkingsystem.parkingsystem.entity.Slot;
import com.parkingsystem.parkingsystem.entity.Ticket;
import com.parkingsystem.parkingsystem.entity.TicketStatus;
import com.parkingsystem.parkingsystem.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    boolean existsByVehicleAndExitTimeIsNull(Vehicle vehicle);
    Optional<Ticket> findByTicketNumber(String ticketNumber);
//    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findAllByStatusAndExitTimeBefore(TicketStatus status,LocalDateTime time);

    @Query("""
SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
FROM Ticket t
WHERE t.slot = :slot
AND t.status = 'OPEN'
AND t.exitTime IS NOT NULL
AND (
    t.entryTime < :endTime
    AND
    t.exitTime > :startTime
)
""")
    boolean existsOverlappingReservation(
            @Param("slot") Slot slot,
            @Param("endTime") LocalDateTime endTime,
            @Param("startTime") LocalDateTime startTime
    );

}
