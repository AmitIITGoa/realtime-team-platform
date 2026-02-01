package com.InteractiveQ.main.repository;

import com.InteractiveQ.main.entities.PollOption;
import com.InteractiveQ.main.entities.Vote;
import com.InteractiveQ.main.entities.VoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, VoteId> {

    List<Vote> findByOption(PollOption option);
    
    // Find existing vote by user and message (via option) to check if they already voted in this poll
    Vote findByPersonAndOption_Message(com.InteractiveQ.main.entities.Person person, com.InteractiveQ.main.entities.Message message);

}
