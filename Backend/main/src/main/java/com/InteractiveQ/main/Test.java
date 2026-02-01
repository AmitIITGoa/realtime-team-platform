package com.InteractiveQ.main;


import com.InteractiveQ.main.entities.Room;
import com.InteractiveQ.main.repository.BelongToRoomRepository;
import com.InteractiveQ.main.repository.PersonRepository;
import com.InteractiveQ.main.repository.RoomRepository;
import com.InteractiveQ.main.service.PersonService;
import com.InteractiveQ.main.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class Test {

    @Autowired
    RoomService roomService;

    @Autowired
    RoomRepository roomRepository;

    @Autowired
    BelongToRoomRepository belongToRoomRepository;

    @Autowired
    PersonRepository personRepository;

    @Autowired
    PersonService personService;


    @PostMapping("testing")
    public ResponseEntity SignUp(){
//        roomService.joinARoom(personRepository.findByUserId("ani3").get(), roomRepository.findByRoomId(2).get(), false);

        var temp = roomService.userWantingToJoinRoom(roomRepository.findByRoomId(2).get());
        var temp2 = roomService.memberOfARoom(roomRepository.findByRoomId(2).get());

        return new ResponseEntity<>("Exception in User Service", HttpStatus.OK);
    }
}
