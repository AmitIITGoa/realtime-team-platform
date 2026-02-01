package com.InteractiveQ.main.entities;

import lombok.*;
import jakarta.persistence.*;


@Entity
@Table(name = "vote")
@IdClass(VoteId.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Vote {

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private Person person;

    @Id
    @ManyToOne
    @JoinColumn(name = "opt_id", referencedColumnName = "opt_id", insertable = false, updatable = false)
    private PollOption option;

    // Getters and Setters
}
