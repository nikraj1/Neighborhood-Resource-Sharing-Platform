package com.nearshare.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NearshareApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(NearshareApiApplication.class, args);
	}

}
