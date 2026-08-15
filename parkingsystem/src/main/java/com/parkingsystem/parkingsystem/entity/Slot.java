package com.parkingsystem.parkingsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Setter
@Getter
@Table(name = "slots")
public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id", nullable = false)
    private Long slotId;

    @Column(name = "slot_number")
    private String slotNum;

    @Enumerated(EnumType.STRING)
    private VehicleType slotType;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status")
    private SlotStatus slotStatus;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;

    @Version
    private Long version;
}
