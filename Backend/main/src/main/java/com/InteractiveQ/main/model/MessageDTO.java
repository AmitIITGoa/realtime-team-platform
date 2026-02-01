package com.InteractiveQ.main.model;

import com.InteractiveQ.main.entities.Message;
import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.PollOption;

import com.InteractiveQ.main.response.message.PollOptionDTO;
import jdk.jfr.Timestamp;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class MessageDTO {
    private Message message;
    private List<PollOptionDTO> pollOptions;

    private List<Person> userLiked;
//    private Boolean isCurrentUser;
}
