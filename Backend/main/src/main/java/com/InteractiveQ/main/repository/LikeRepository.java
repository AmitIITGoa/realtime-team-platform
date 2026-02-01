package com.InteractiveQ.main.repository;


//import com.InteractiveQ.main.entities.Like;
import com.InteractiveQ.main.entities.LikeId;
import com.InteractiveQ.main.entities.LikeMessage;
import com.InteractiveQ.main.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<LikeMessage, LikeId> {

    List<LikeMessage> findByMessage(Message message);
}
