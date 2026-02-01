package com.InteractiveQ.main.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BelongToRoomId implements Serializable {
    private Person person;
    private Room room;
}
