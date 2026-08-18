package com.parkingsystem.parkingsystem.util;

import com.parkingsystem.parkingsystem.entity.VehicleType;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class TicketPricingUtil {
    public double calculateAmount(VehicleType type, long hours) {
        double rate = switch (type) {
            case CAR -> 20;
            case BIKE -> 10;
            case TRUCK -> 40;
        };
        return hours * rate;
    }

    public long billableHours(LocalDateTime start, LocalDateTime end) {
        long hours = Duration.between(start, end).toHours();
        return hours == 0 ? 1 : hours;
    }

    public String generateTicketNumber() {
        return "TCKT-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
