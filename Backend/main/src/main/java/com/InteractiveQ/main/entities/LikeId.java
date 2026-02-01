package com.InteractiveQ.main.entities;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.aspectj.weaver.patterns.PerObject;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeId implements Serializable {
    private Person person;
    private Message message;
}
