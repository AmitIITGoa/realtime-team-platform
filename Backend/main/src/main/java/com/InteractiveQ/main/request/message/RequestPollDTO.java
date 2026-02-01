package com.InteractiveQ.main.request.message;


import com.InteractiveQ.main.entities.Message;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RequestPollDTO {
    private Boolean isAnonymous;

    private Boolean isPoll;

    private String text;

    private Message taggedMessage;

    private Integer roomId;

    private List<String> pollOptions;
}
