package com.InteractiveQ.main.entities;

import lombok.*;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "poll_option")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class PollOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "opt_id")
    private Integer optId;

    @Column(name = "opt_text")
    private String optText;

    @ManyToOne
    @JoinColumn(name = "message_id", referencedColumnName = "message_id")
    private Message message;

    // Getters and Setters
}

