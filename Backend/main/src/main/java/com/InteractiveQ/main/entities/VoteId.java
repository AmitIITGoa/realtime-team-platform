package com.InteractiveQ.main.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteId implements Serializable {
    private PollOption option;
    private Person person;

    // Default Constructor, Equals, HashCode
}
