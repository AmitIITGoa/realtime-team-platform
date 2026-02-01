package com.InteractiveQ.main.service;

import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.repository.PersonRepository;
import com.InteractiveQ.main.request.PersonDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PersonService {

    @Autowired
    PersonRepository personRepository;


    public Optional<Person> getUserByUserId(String userId){
        return personRepository.findByUserId(userId);
    }

    public Boolean isSignUp(PersonDTO personDTO){
        return personRepository.findByEmail(personDTO.getEmail()).isEmpty();
    }

    public void saveUser(Person person){
        personRepository.save(person);
    }

    public Optional <Person> getByEmailAndPassword(String email, String password){
        return personRepository.findByEmailAndPassword(email, password);
    }

    public Optional<Person> userProfile(String userId){
        return personRepository.findByUserId(userId);
    }

}
