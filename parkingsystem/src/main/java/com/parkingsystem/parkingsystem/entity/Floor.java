package com.parkingsystem.parkingsystem.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "floors")
public class Floor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "floor_id", nullable = false)
    private Long id;

    @Column(name = "floor_number")
    private int floorNum;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "parking_lot_id", nullable = false)
    @JsonBackReference
    private ParkingLot parkingLot;

    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL)
    private List<Slot> slot = new ArrayList<>();
}
