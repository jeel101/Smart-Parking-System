package com.parkingsystem.parkingsystem.dto;

import com.parkingsystem.parkingsystem.entity.VehicleType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SlotAvailabilityDto {
    private Long slotId;
    private String slotNum;
    private VehicleType slotType;
    private boolean available;
    private String reason;
}
