package com.InteractiveQ.main.controller;


import com.InteractiveQ.main.entities.*;
import com.InteractiveQ.main.model.MessageDTO;
import com.InteractiveQ.main.request.message.RequestAllMessagesDTO;
import com.InteractiveQ.main.request.message.RequestMessageDTO;
import com.InteractiveQ.main.request.message.RequestPollDTO;
import com.InteractiveQ.main.request.message.RequestPollOptionDTO;
import com.InteractiveQ.main.service.JwtService;
import com.InteractiveQ.main.service.PersonService;
import com.InteractiveQ.main.service.RoomService;
import com.InteractiveQ.main.service.message.LikeService;
import com.InteractiveQ.main.service.message.MessageService;
import com.InteractiveQ.main.service.message.PollService;
import com.InteractiveQ.main.service.message.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;
    @Autowired
    MessageService messageService;

    public MessageController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @Autowired
    LikeService likeService;
    @Autowired
    PollService pollService;
    @Autowired
    VoteService voteService;
    @Autowired
    PersonService personService;
    @Autowired
    JwtService jwtService;
    @Autowired
    RoomService roomService;

    @PostMapping("user/room/message/send")
    public ResponseEntity<MessageDTO> sendMessage(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody RequestMessageDTO messageDTO
            ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(messageDTO.getRoomId());
        if(user.isPresent() && room.isPresent() && messageService.isUserBelongToRoom(username, messageDTO.getRoomId())){

            if(room.get().getIsEnded()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            Message message = new Message();
            message.setTaggedMessage(messageDTO.getTaggedMessage());
            message.setRoom(room.get());
            message.setText(messageDTO.getText());
            message.setUser(user.get());
            message.setIsAnonymous(messageDTO.getIsAnonymous());
            message.setIsPoll(messageDTO.getIsPoll());
            MessageDTO savedMessage = messageService.saveMessage(message, null);


//            messagingTemplate.convertAndSend("/topic/messages/" + messageDTO.getRoomId(), savedMessage);

            return ResponseEntity.status(HttpStatus.OK).body(savedMessage);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    @PostMapping("user/room/poll/send")
    public ResponseEntity<MessageDTO> sendPoll(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody RequestPollDTO requestPollDTO
            ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(requestPollDTO.getRoomId());
        if(user.isPresent() && room.isPresent() && messageService.isUserBelongToRoom(username, requestPollDTO.getRoomId())){

            if(room.get().getIsEnded()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            Message message = new Message();
            message.setTaggedMessage(requestPollDTO.getTaggedMessage());
            message.setRoom(room.get());
            message.setText(requestPollDTO.getText());
            message.setUser(user.get());
            message.setIsAnonymous(requestPollDTO.getIsAnonymous());
            message.setIsPoll(requestPollDTO.getIsPoll());
            List <PollOption> pollOptions = new ArrayList<>();
            for(String requestPollOptionDTO : requestPollDTO.getPollOptions()){
                PollOption pollOption = new PollOption();
                pollOption.setOptText(requestPollOptionDTO);
                pollOptions.add(pollOption);
            }
            MessageDTO savedMessage =  messageService.saveMessage(message, pollOptions);
            return ResponseEntity.status(HttpStatus.OK).body(savedMessage);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error Occurred while Saving Poll");
    }

    @PostMapping("user/room/getMessages")
    public ResponseEntity<List<MessageDTO>> getAllMessages(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody RequestAllMessagesDTO requestAllMessagesDTO
            ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Room> room = roomService.getRoom(requestAllMessagesDTO.getRoomId());
        if (user.isPresent() && room.isPresent() && messageService.isUserBelongToRoom(username, requestAllMessagesDTO.getRoomId())) {
            return ResponseEntity.status(HttpStatus.OK).body(messageService.fetchMessagesWithPolls(room.get(), user.get()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    @PatchMapping("user/room/poll/vote")
    public ResponseEntity<Vote> voteInPoll(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody Map<String, Integer> request
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<PollOption> pollOption = pollService.getPollOptionById(request.get("optId"));
        if(user.isPresent() && pollOption.isPresent() &&
            messageService.isMessageBelongToSameRoomAsUser(pollOption.get().getMessage().getMessageId(), username)
        ){
            Vote vote = voteService.voteInPoll(user.get(), pollOption.get());
            return ResponseEntity.status(HttpStatus.OK).body(vote);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    @PatchMapping("user/room/message/like")
    public ResponseEntity<LikeMessage> likeMessage(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody Map<String, Integer> request
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Message> message = messageService.getMessageById(request.get("messageId"));
        if(user.isPresent() && message.isPresent() &&
                messageService.isMessageBelongToSameRoomAsUser(message.get().getMessageId(), username)
        ){
            LikeMessage like = likeService.messageLike(user.get(), message.get());
            return ResponseEntity.status(HttpStatus.OK).body(like);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    @PatchMapping("user/room/message/unlike")
    public ResponseEntity<LikeMessage> unlikeMessage(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = true) String authHeader,
            @RequestBody Map<String, Integer> request
    ){
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<Person> user = personService.userProfile(username);
        Optional<Message> message = messageService.getMessageById(request.get("messageId"));
        if(user.isPresent() && message.isPresent() &&
                messageService.isMessageBelongToSameRoomAsUser(message.get().getMessageId(), username)
        ){
            likeService.messageUnlike(user.get(), message.get());
            return ResponseEntity.status(HttpStatus.OK).body(new LikeMessage(user.get(), message.get()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }
}
