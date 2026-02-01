package com.InteractiveQ.main.repository;

import com.InteractiveQ.main.entities.Message;
import com.InteractiveQ.main.entities.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Integer> {
    List<PollOption> findByMessage(Message message);
}
