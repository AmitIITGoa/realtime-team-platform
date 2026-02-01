package com.InteractiveQ.main.request.room;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddUserToGroupDTO {
    private Integer roomId;
    private String userId;
}
