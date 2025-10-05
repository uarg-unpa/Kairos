package com.nextech.kairos;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;
@SpringBootApplication
public class KairosApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                              .ignoreIfMalformed()  // Opcional
                              .ignoreIfMissing()    // Opcional
                              .load();

        // Setear como variables del sistema para que Spring pueda usarlas
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
        SpringApplication.run(KairosApplication.class, args);
    }
}
