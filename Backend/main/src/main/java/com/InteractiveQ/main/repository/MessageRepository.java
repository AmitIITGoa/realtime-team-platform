package com.InteractiveQ.main.repository;

import com.InteractiveQ.main.entities.Message;
import com.InteractiveQ.main.entities.Room;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByRoom(Room room, Sort sort);
}
