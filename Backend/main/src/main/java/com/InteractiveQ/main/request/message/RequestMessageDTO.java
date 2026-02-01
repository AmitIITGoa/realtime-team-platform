package com.InteractiveQ.main.request.message;


import com.InteractiveQ.main.entities.Message;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RequestMessageDTO {
    private Boolean isAnonymous;

    private Boolean isPoll;

    private String text;

    private Message taggedMessage;

    private Integer roomId;
}
