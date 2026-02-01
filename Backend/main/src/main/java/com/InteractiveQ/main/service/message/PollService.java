package com.InteractiveQ.main.service.message;


import com.InteractiveQ.main.entities.Message;
import com.InteractiveQ.main.entities.PollOption;
import com.InteractiveQ.main.repository.PollOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PollService {

//    public List<PollOption> savePoll(Message message, ){
//
//    }
    @Autowired
    PollOptionRepository pollOptionRepository;

    public Optional<PollOption> getPollOptionById(Integer optId){
        return pollOptionRepository.findById(optId);
    }
}
