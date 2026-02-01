package com.InteractiveQ.main.repository;

import com.InteractiveQ.main.entities.Person;
import com.InteractiveQ.main.entities.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface SessionTokenRepository extends JpaRepository<SessionToken, Integer> {

    Optional<SessionToken> findByToken(String token);

    Optional<SessionToken> findByPerson(Person person);
}
