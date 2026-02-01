package com.InteractiveQ.main.response.message;


import com.InteractiveQ.main.entities.Message;
import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.PollOption;
import com.InteractiveQ.main.model.MessageDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PollOptionDTO {
    private Integer optId;
    private String optText;
    private Message message;

    private List<Person> userVoted;

    public PollOptionDTO(PollOption pollOption, List<Person> personList){
        this.optId = pollOption.getOptId();
        this.optText = pollOption.getOptText();
        this.message = pollOption.getMessage();
        this.userVoted = personList;
    }
}
