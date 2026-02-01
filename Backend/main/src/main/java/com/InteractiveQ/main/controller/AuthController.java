package com.InteractiveQ.main.controller;


import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.repository.PersonRepository;
import com.InteractiveQ.main.request.PersonDTO;
import com.InteractiveQ.main.service.PersonService;
import com.InteractiveQ.main.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class AuthController {

    @Autowired
    PersonService personService;

    @Autowired
    RefreshTokenService refreshTokenService;

    @GetMapping("auth")
    public void test(){
        System.out.println("Hello");
    }

    @PostMapping("auth/v1/signup")
    public ResponseEntity<String> signUp(@RequestBody PersonDTO personDTO){
        try{
            Boolean isSignUped = personService.isSignUp(personDTO);
            if(Boolean.FALSE.equals(isSignUped)){
                return new ResponseEntity<>("Already Exist", HttpStatus.BAD_REQUEST);
            }

            Person currUser = new Person(UUID.randomUUID().toString(), personDTO.getName(),
                    personDTO.getEmail(), personDTO.getPassword());
            personService.saveUser(currUser);
            return ResponseEntity.status(HttpStatus.OK).body("Successfully Account Created");
        }catch (Exception ex){
            return new ResponseEntity<>("Exception in User Service", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
