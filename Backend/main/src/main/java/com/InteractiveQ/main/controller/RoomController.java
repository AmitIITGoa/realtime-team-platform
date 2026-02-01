package com.InteractiveQ.main.controller;


import com.InteractiveQ.main.entities.BelongToRoom;
import com.InteractiveQ.main.entities.BelongToRoomId;
import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.Room;
import com.InteractiveQ.main.request.room.AddUserToGroupDTO;
import com.InteractiveQ.main.request.room.CreateRoomDTO;
import com.InteractiveQ.main.request.room.JoinRoomDTO;
import com.InteractiveQ.main.request.room.RenameRoomDTO;
import com.InteractiveQ.main.service.JwtService;
import com.InteractiveQ.main.service.PersonService;
import com.InteractiveQ.main.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class RoomController {
    @Autowired
    RoomService roomService;
    @Autowired
    JwtService jwtService;
    @Autowired
    PersonService personService;

    @PostMapping("user/createRoom")
    public ResponseEntity<Room> createRoom(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody CreateRoomDTO createRoomDTO
            ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        if(user.isPresent()){
            Room room = roomService.createRoom(user.get(), createRoomDTO.getRoomName());
            return ResponseEntity.status(HttpStatus.OK).body(room);
        }
        else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PostMapping("user/joinRoom")
    public ResponseEntity<String> joinRoom(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody JoinRoomDTO joinRoomDTO
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Refresh Token");
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        if(user.isPresent()){
            Optional<Room> room = roomService.getRoom(joinRoomDTO.getRoomId());
            if(room.isPresent()){
                System.out.println(joinRoomDTO.getRoomId());
                roomService.joinARoom(user.get(), room.get(), false);
                return ResponseEntity.status(HttpStatus.OK).body("Joined Room" + room.get().getRoomName());
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No such User Or Room Exist");

    }

    @GetMapping("user/allRoom")
    public ResponseEntity<List<Room>> getAllRoom(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        if(user.isPresent()){
            List <Room> rooms = roomService.fetchUserRooms(user.get());
            return ResponseEntity.status(HttpStatus.OK).body(rooms);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
    }

    @PatchMapping("user/room/rename")
    public ResponseEntity<Room> renameRoom(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody RenameRoomDTO renameRoomDTO
            ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        if(user.isPresent()){
            Room room = roomService.renameRoom(renameRoomDTO.getRoomId(), renameRoomDTO.getNewName(), user.get());
            return ResponseEntity.status(HttpStatus.OK).body(room);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
    }

    @PatchMapping("user/room/authenticateUser")
    public ResponseEntity<String> addUserToRoom(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody AddUserToGroupDTO addUserToGroupDTO
            ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(addUserToGroupDTO.getRoomId());
        Optional<Person> userToBeAuthenticated = personService.userProfile(addUserToGroupDTO.getUserId());
        if(user.isPresent() && room.isPresent() && userToBeAuthenticated.isPresent()
         && room.get().getAdmin().getUserId().equals(user.get().getUserId())){
            roomService.authenticateJoinRoom(room.get(), userToBeAuthenticated.get());
            return ResponseEntity.status(HttpStatus.OK).body("Successfully Added User");
        }
        else{
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null);
        }
    }

    @PostMapping("user/room/allUser")
    public ResponseEntity<List<BelongToRoom>> allMembers(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody JoinRoomDTO joinRoomDTO
    ){
        Optional<Room> room = roomService.getRoom(joinRoomDTO.getRoomId());
        if(room.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(roomService.allMemberOfARoom(room.get()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    @DeleteMapping("user/room/removeUser")
    public ResponseEntity<String> removeUserAdmin(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody AddUserToGroupDTO addUserToGroupDTO
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Fuck Offff");
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(addUserToGroupDTO.getRoomId());
        Optional<Person> userToBeRemoved = personService.userProfile(addUserToGroupDTO.getUserId());
        if(user.isPresent() && room.isPresent() && userToBeRemoved.isPresent() &&
            user.get().getUserId().equals(room.get().getAdmin().getUserId())
        ){
            if(userToBeRemoved.get().getUserId().equals(room.get().getAdmin().getUserId())){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You are Admin you cannot remove yourself");
            }
            roomService.removeUserFromRoom(room.get(), userToBeRemoved.get());
            return ResponseEntity.status(HttpStatus.OK).body("Successfully Removed User");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are Not Admin");
    }

    @DeleteMapping("user/room/leaveRoom")
    public ResponseEntity<String> leaveRoom(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody JoinRoomDTO joinRoomDTO
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(joinRoomDTO.getRoomId());

        if(user.isPresent() && room.isPresent() &&
                !user.get().getUserId().equals(room.get().getAdmin().getUserId())
        ){
            roomService.leaveARoom(room.get(), user.get());
            return ResponseEntity.status(HttpStatus.OK).body("Successfully Removed User");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You Cannot Leave You Are Admin");
    }

    @DeleteMapping("user/room/deleteRoom")
    public ResponseEntity<String> deleteRoom(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody JoinRoomDTO joinRoomDTO
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(joinRoomDTO.getRoomId());

        if(user.isPresent() && room.isPresent() &&
                user.get().getUserId().equals(room.get().getAdmin().getUserId())
        ){
            roomService.endARoom(room.get());
            return ResponseEntity.status(HttpStatus.OK).body("Successfully Ended Room");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not admin");
    }

    @PostMapping("user/room/isUserAuthorized")
    public  ResponseEntity<Boolean> isUserAuthorized(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody  JoinRoomDTO joinRoomDTO
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        System.out.println("Is is called");
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(joinRoomDTO.getRoomId());
        System.out.println(joinRoomDTO.getRoomId());
        if(user.isPresent() && room.isPresent()){
            System.out.println("Hello");

            Optional<BelongToRoom> belongToRoom = roomService.findByRoomAndUser(user.get(), room.get());
            if(belongToRoom.isPresent()){
                System.out.println("Hello");
                if(belongToRoom.get().getIsAuthenticated() && !belongToRoom.get().getIsExited()){
                    return ResponseEntity.status(HttpStatus.OK).body(true);
                }
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
            }
            else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(true);
    }
}
