package com.parkingsystem.parkingsystem.util;

import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class VehicleValidationUtil {
    public String validateVehicleNumber(String vehicleNumber) {
        if(vehicleNumber == null || vehicleNumber.isBlank()) {
            throw new IllegalArgumentException("Vehicle number is required");
        }

        String normalizedNumber = vehicleNumber.trim().toUpperCase(Locale.ROOT);

        if(!normalizedNumber.matches("^[A-Z]{2}\\d{2}[A-Z]{1,2}\\d{4}$")) {
            throw new IllegalArgumentException("Invalid vehicle number. Expected format: MH12AB1234");
        }

        return normalizedNumber;
    }
}
