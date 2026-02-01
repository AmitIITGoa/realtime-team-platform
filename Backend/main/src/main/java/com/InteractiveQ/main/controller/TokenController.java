package com.InteractiveQ.main.controller;


import com.InteractiveQ.main.entities.BelongToRoom;
import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.Room;
import com.InteractiveQ.main.entities.SessionToken;
import com.InteractiveQ.main.request.AuthRequestDTO;
import com.InteractiveQ.main.request.RefreshTokenRequestDTO;
import com.InteractiveQ.main.request.room.JoinRoomDTO;
import com.InteractiveQ.main.response.JwtResponseDTO;
import com.InteractiveQ.main.service.JwtService;
import com.InteractiveQ.main.service.PersonService;
import com.InteractiveQ.main.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class TokenController {

    @Autowired
    PersonService personService;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Autowired
    JwtService jwtService;

    @PostMapping("auth/v1/login")
    public ResponseEntity<JwtResponseDTO> AuthenticateAndGetToken(@RequestBody AuthRequestDTO authRequestDTO){
        Optional<Person> user = personService.getByEmailAndPassword(authRequestDTO.getEmail(), authRequestDTO.getPassword());

        if(user.isPresent()){
            Person currUser = user.get();
            SessionToken sessionToken = refreshTokenService.createSessionToken(currUser.getUserId());
            return ResponseEntity.status(HttpStatus.OK).body(new JwtResponseDTO(
                    jwtService.GenerateToken(currUser.getUserId()),
                    sessionToken.getToken()
            ));
        }
        else{
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

    }

    @GetMapping("user/Profile")
    public ResponseEntity<Person> allMembers(
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
            return ResponseEntity.status(HttpStatus.OK).body(user.get());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    @PostMapping("auth/v1/refreshToken")
    public ResponseEntity<JwtResponseDTO> refreshToken(@RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO){

        Optional<SessionToken> sessionToken = refreshTokenService.findByToken(refreshTokenRequestDTO.getToken());
        if(sessionToken.isPresent()){
            if(refreshTokenService.verifyExpiration(sessionToken.get())){
                return ResponseEntity.status(HttpStatus.OK).body(
                        new JwtResponseDTO(jwtService.GenerateToken(sessionToken.get().getPerson().getUserId()),
                                sessionToken.get().getToken())
                );
            }
            else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
        }
        else{
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
