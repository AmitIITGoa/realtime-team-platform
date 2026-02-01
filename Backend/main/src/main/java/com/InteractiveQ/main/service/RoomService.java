package com.InteractiveQ.main.service;


import com.InteractiveQ.main.entities.BelongToRoom;
import com.InteractiveQ.main.entities.BelongToRoomId;
import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.Room;
import com.InteractiveQ.main.repository.BelongToRoomRepository;
import com.InteractiveQ.main.repository.PersonRepository;
import com.InteractiveQ.main.repository.RoomRepository;
import jakarta.transaction.Transactional;
import org.aspectj.weaver.patterns.PerObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    RoomRepository roomRepository;

    @Autowired
    BelongToRoomRepository belongToRoomRepository;

    @Autowired
    PersonRepository personRepository;

    @Autowired
    PersonService personService;

//    This function is used to Create a Room. If room is created successfully room is returned else null;
    @Transactional
    public Room createRoom(Person user, String roomName){
        Room newRoom = new Room();
        newRoom.setRoomName(roomName);
        newRoom.setAdmin(user);
        newRoom.setIsEnded(false);
        Room savedRoom = roomRepository.save(newRoom);
//           This because when we are creating a Room we have to add it to belong_to_room
        joinARoom(user, savedRoom, true);
        return savedRoom;
    }

//    This function will make you join a room by default is_authenticated will be false
//    But for admin you have to pass is_authenticated as true
    public void joinARoom(Person user, Room room, Boolean isAuthenticated){
        BelongToRoom belongToRoom = new BelongToRoom(isAuthenticated, false,
                user, room);
        BelongToRoom saved = belongToRoomRepository.save(belongToRoom);
    }

//    This function will return all the room to which the user belong. Note that some classes
//    will be like is_ended = true. So when implemeting message service do not accept any message in this
//    type of rooms *********---------**********
    public List<Room> fetchUserRooms(Person user){
        List <BelongToRoom> userRooms = belongToRoomRepository.findByPerson(user);

        List <Room> validRooms = new ArrayList<>();
        for (BelongToRoom belongToRoom : userRooms) {
            if (!belongToRoom.getIsExited() && !belongToRoom.getRoom().getIsEnded()) {
                validRooms.add(belongToRoom.getRoom());
            }
        }
        return validRooms;
    }

//    This function is used to rename the name of a particular Room
//    Note that it should be already checked if user is admin of group or not. (Should be written in API controller)
    public Room renameRoom(Integer roomId, String newName, Person person){
        Room room = roomRepository.findByRoomId(roomId).get();
        if(room.getAdmin().getUserId().equals(person.getUserId())){
            room.setRoomName(newName);
            return roomRepository.save(room);
        }
        throw new RuntimeException("You are Not Admin");
    }

//    After joining a room it need to be authenticated by the admin__
//    So, now if authenticated by the admin. Note that this function to be called only when
//    "a room admin is calling it"
    public void authenticateJoinRoom(Room room, Person userToBeAuthenticated){
        Optional<BelongToRoom> temp = belongToRoomRepository.findById(new BelongToRoomId(userToBeAuthenticated, room));
        if(temp.isPresent()) {
            temp.get().setIsAuthenticated(true);
            belongToRoomRepository.save(temp.get());
        }
        else{
            throw new RuntimeException("No such Room exist");
        }
    }

//    This function return all the user whose is_authenticated = false, for a specific room
    public List <Person> userWantingToJoinRoom(Room room){
        List <BelongToRoom> roomMember = belongToRoomRepository.findByRoom(room);
        List <Person> validMember = new ArrayList<>();
        for (BelongToRoom belongToRoom : roomMember) {
            if(!belongToRoom.getIsAuthenticated() && !belongToRoom.getIsExited()){
                validMember.add(belongToRoom.getPerson());
            }
        }
        return validMember;
    }

//    This function return all the user whose is_authenticated = true, for a specific room
    public List <Person> memberOfARoom(Room room){
        List <BelongToRoom> roomMember = belongToRoomRepository.findByRoom(room);
        List <Person> validMember = new ArrayList<>();
        for (BelongToRoom belongToRoom : roomMember) {
            if(belongToRoom.getIsAuthenticated() && !belongToRoom.getIsExited()){
                validMember.add(belongToRoom.getPerson());
            }
        }
        return validMember;
    }

//    This is similar to above Two because we do not need it we can do that in frontend itself.
//    Not that if a user left the group then also we are including it in the list we can do whatever we want
//    with them in frontend
    public List<BelongToRoom> allMemberOfARoom(Room room){
        List <BelongToRoom> roomMember = belongToRoomRepository.findByRoom(room);
//        List <Person> validMember = new ArrayList<>();
//        for (BelongToRoom belongToRoom : roomMember) {
//            validMember.add(belongToRoom.getPerson());
//        }
        return roomMember;
    }

//    This function remove a user from a group
//    Note that this function can only be called by the admin. So, before calling this check whether
//    it is called by admin or not
    public void removeUserFromRoom(Room room, Person user){
        Optional<BelongToRoom> temp = belongToRoomRepository.findById(new BelongToRoomId(user, room));
        if(temp.isPresent()){
            temp.get().setIsExited(true);
            belongToRoomRepository.save(temp.get());
        }
    }

//    Exiting a group. Same as above but note here that admin cannot leave. i.e. in UI instead of showing
//    leave to admin we will show "end session" ************------------***********
    public void leaveARoom(Room room, Person user){
        Optional<BelongToRoom> temp = belongToRoomRepository.findById(new BelongToRoomId(user, room));
        if(temp.isPresent()){
            temp.get().setIsExited(true);
            belongToRoomRepository.save(temp.get());
        }
    }

    public void endARoom(Room room){
        room.setIsEnded(true);
        roomRepository.save(room);
    }

//
    public Optional<Room> getRoom(Integer roomId){
        return roomRepository.findByRoomId(roomId);
    }

//    public Boolean checkIfRoomAlreadyEnded

    public Optional<BelongToRoom> findByRoomAndUser(Person user, Room room){
        return belongToRoomRepository.findById(new BelongToRoomId(user, room));
    }
}
