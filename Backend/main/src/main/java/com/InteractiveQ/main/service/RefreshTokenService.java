package com.InteractiveQ.main.service;


import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.SessionToken;
import com.InteractiveQ.main.repository.PersonRepository;
import com.InteractiveQ.main.repository.SessionTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Autowired
    PersonRepository personRepository;
    @Autowired
    SessionTokenRepository sessionTokenRepository;

    public SessionToken createSessionToken(String userId){
        Person person = personRepository.findByUserId(userId).get();
        Optional<SessionToken> temp = sessionTokenRepository.findByPerson(person);
        if(temp.isPresent()){
            sessionTokenRepository.delete(temp.get());
        }
        SessionToken sessionToken = new SessionToken();
        sessionToken.setToken(UUID.randomUUID().toString());
        sessionToken.setPerson(person);
        sessionToken.setExpiryDate(Instant.now().plusMillis(6000000));

        return sessionTokenRepository.save(sessionToken);
    }

    public Optional<SessionToken> findByToken(String token){
        return sessionTokenRepository.findByToken(token);
    }

    public Boolean verifyExpiration(SessionToken token){
        //            sessionTokenRepository.delete(token);
        return token.getExpiryDate().compareTo(Instant.now()) >= 0;
    }

}
