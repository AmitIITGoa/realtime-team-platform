package com.InteractiveQ.main.service.message;


import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.PollOption;
import com.InteractiveQ.main.entities.Vote;
import com.InteractiveQ.main.repository.PollOptionRepository;
import com.InteractiveQ.main.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VoteService {

    @Autowired
    VoteRepository voteRepository;
//    This function is used to like vote in the poll
//    In UI force that once selected any option you can not change it and also cannot choose multiple options
    public Vote voteInPoll(Person person, PollOption pollOption){
        // Check if user already voted in this poll
        Vote existingVote = voteRepository.findByPersonAndOption_Message(person, pollOption.getMessage());
        if (existingVote != null) {
            voteRepository.delete(existingVote);
        }
        
        Vote vote = new Vote(person, pollOption);
        return voteRepository.save(vote);
    }

}
