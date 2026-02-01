package com.InteractiveQ.main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "session_token")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SessionToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "token")
    private String token;
    @Column(name = "expiry_data")
    private Instant expiryDate;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private Person person;

    // Getters and Setters
}



