package com.InteractiveQ.main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "room")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Integer roomId;

    @Column(name = "room_name")
    private String roomName;
    @Column(name = "is_ended")
    private Boolean isEnded;

    @ManyToOne
    @JoinColumn(name = "admin_id", referencedColumnName = "user_id")
    private Person admin;
}
