package com.nextech.kairos.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE tiempo MODIFY idTarea BIGINT NULL");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE tiempo MODIFY id_tarea BIGINT NULL");
            } catch (Exception e2) {
            }
        }

        try {
            jdbcTemplate.execute("ALTER TABLE tarea MODIFY nombre VARCHAR(255) NOT NULL");
        } catch (Exception e) {
        }
    }
}
