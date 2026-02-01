package com.InteractiveQ.main.entities;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "belong_to_room")
@IdClass(BelongToRoomId.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class BelongToRoom {

    @Column(name = "is_authenticated")
    private Boolean isAuthenticated;
    @Column(name = "is_exited")
    private Boolean isExited;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private Person person;

    @Id
    @ManyToOne
    @JoinColumn(name = "room_id", referencedColumnName = "room_id", insertable = false, updatable = false)
    private Room room;

    // Getters and Setters
}
