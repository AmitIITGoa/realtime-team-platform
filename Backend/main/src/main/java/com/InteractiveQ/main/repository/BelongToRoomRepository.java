package com.InteractiveQ.main.repository;

import com.InteractiveQ.main.entities.BelongToRoom;
import com.InteractiveQ.main.entities.BelongToRoomId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.Room;
import java.util.*;


@Repository
public interface BelongToRoomRepository extends JpaRepository<BelongToRoom, BelongToRoomId> {

    List<BelongToRoom> findByPerson(Person person);

    List <BelongToRoom> findByRoom(Room room);


}
