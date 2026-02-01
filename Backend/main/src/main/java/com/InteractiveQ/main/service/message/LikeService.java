package com.InteractiveQ.main.service.message;


//import com.InteractiveQ.main.entities.Like;
import com.InteractiveQ.main.entities.LikeMessage;
import com.InteractiveQ.main.entities.Message;
import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.Vote;
import com.InteractiveQ.main.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeService {
//    @Autowired
    @Autowired
    LikeRepository likeRepository;

//    This function is used to add a message liked by a user
//    Check that whether the Person and Message belong to same Room
    public LikeMessage messageLike(Person person, Message message){
        return likeRepository.save(new LikeMessage(person, message));
    }

    public void messageUnlike(Person person, Message message){
        likeRepository.delete(new LikeMessage(person, message));
    }

}
