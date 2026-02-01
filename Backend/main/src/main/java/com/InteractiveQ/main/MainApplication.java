package com.InteractiveQ.main;

import com.InteractiveQ.main.service.PersonService;
import com.InteractiveQ.main.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class MainApplication {
	@Autowired
	RoomService roomService;

	public static void main(String[] args) {

		SpringApplication.run(MainApplication.class, args);
	}

}
