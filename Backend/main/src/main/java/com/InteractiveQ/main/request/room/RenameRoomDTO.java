package com.InteractiveQ.main.request.room;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RenameRoomDTO {
    private String newName;
    private Integer roomId;
}
