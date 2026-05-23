package com.parkingsystem.parkingsystem.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name="parking_lots")
public class ParkingLot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "parking_lot_id", nullable = false)
    private Long id ;

    @Column(name = "name", nullable = false)
    private String name;

    @OneToMany(mappedBy = "parkingLot", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Floor> floor = new ArrayList<>();
}
