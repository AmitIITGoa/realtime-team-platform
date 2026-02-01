package com.InteractiveQ.main.service.message;


import com.InteractiveQ.main.entities.*;
import com.InteractiveQ.main.model.MessageDTO;
import com.InteractiveQ.main.repository.*;
import com.InteractiveQ.main.response.message.PollOptionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/*
Please note that before calling this service, Room and Message.room_id should be same
and also user which is querying this service should also be from same room
and should be authenticated and not exited
*/

@Service
public class MessageService {
    @Autowired
    MessageRepository messageRepository;
    @Autowired
    PollOptionRepository pollOptionRepository;
    @Autowired
    BelongToRoomRepository belongToRoomRepository;
    @Autowired
    PersonRepository personRepository;
    @Autowired
    RoomRepository roomRepository;
    @Autowired
    VoteRepository voteRepository;
    @Autowired
    LikeRepository likeRepository;

    public Boolean isUserBelongToRoom(String userId, Integer roomId){
        Optional<BelongToRoom> belongToRoom = belongToRoomRepository.findById(new BelongToRoomId(personRepository.findByUserId(userId).get(),
                roomRepository.findByRoomId(roomId).get()));
        if(belongToRoom.isPresent() && !belongToRoom.get().getIsExited() && belongToRoom.get().getIsAuthenticated()){
            return true;
        }
        return false;
    }

    public Boolean isMessageBelongToSameRoomAsUser(Integer messageId, String userId){
        Optional<Message> message = messageRepository.findById(messageId);
        Optional<Person> user = personRepository.findByUserId(userId);
        if(message.isPresent() && user.isPresent()){
            Optional <BelongToRoom> belongToRoom = belongToRoomRepository.findById(new BelongToRoomId(user.get(),
                    message.get().getRoom()));
            return belongToRoom.isPresent();
        }
        return false;
    }

//    This function will save a message in the database. Before calling this note that above
//    criteria is fullfilled
    public MessageDTO saveMessage(Message message, List<PollOption> pollOptionList){
        Message savedMessage = messageRepository.save(message);
        MessageDTO requiredMessage = new MessageDTO();
        List <PollOption> savedPoll = new ArrayList<>();

        if(savedMessage.getIsPoll().equals(Boolean.TRUE)){
            for(PollOption temp : pollOptionList){
                temp.setMessage(savedMessage);
                savedPoll.add(pollOptionRepository.save(temp));
            }
        }
        requiredMessage.setMessage(savedMessage);
        List<PollOptionDTO> pollOptionDTOS = new ArrayList<>();
        for(PollOption pollOption : savedPoll){
            PollOptionDTO pollOptionDTO = new PollOptionDTO(pollOption, new ArrayList<>());
            pollOptionDTOS.add(pollOptionDTO);
        }

        requiredMessage.setUserLiked(new ArrayList<>());
//        requiredMessage.setPollOptions(savedPoll);
        requiredMessage.setPollOptions(pollOptionDTOS);
        return requiredMessage;
    }

//    This function is used to return all the message belonging to a room
    public List<MessageDTO> fetchMessagesWithPolls(Room room, Person user) {
//        Return the list in sorted order
        List<Message> messages = messageRepository.findByRoom(room, Sort.by("postTime").ascending());
        List<MessageDTO> result = new ArrayList<>();
        for (Message message : messages) {
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setMessage(message);
            if (Boolean.TRUE.equals(message.getIsPoll())) {
                List<PollOption> pollOptions = pollOptionRepository.findByMessage(message);
//                messageDTO.setPollOptions(pollOptions);
                List <PollOptionDTO> pollOptionDTOS = new ArrayList<>();
                for(PollOption pollOption : pollOptions){
                    List <Vote> votes = voteRepository.findByOption(pollOption);
                    pollOptionDTOS.add(new PollOptionDTO(pollOption, votes.stream().map(Vote::getPerson).toList()));
                }
                messageDTO.setPollOptions(pollOptionDTOS);
            }

            messageDTO.setUserLiked(likeRepository.findByMessage(message)
                    .stream().map(LikeMessage::getPerson).toList());
//            messageDTO.setIsCurrentUser(message.getUser().getUserId().equals(user.getUserId()));
            if(messageDTO.getUserLiked() == null) messageDTO.setUserLiked(new ArrayList<>());
            result.add(messageDTO);
        }
        return result;
    }


    public Optional<Message> getMessageById(Integer messageId){
        return messageRepository.findById(messageId);
    }



}
