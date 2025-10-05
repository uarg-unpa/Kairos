package com.nextech.kairos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories; // ¡IMPORTANTE!

@SpringBootApplication
@EnableJpaRepositories("com.nextech.kairos.repository") 
public class KairosApplication {

    public static void main(String[] args) {
        SpringApplication.run(KairosApplication.class, args);
    }
}
