package com.InteractiveQ.main.repository;

import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByRoomId(Integer roomId);
}
