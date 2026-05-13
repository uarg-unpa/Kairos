package com.nextech.kairos.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Automates the database migration for legacy databases.
 * Previous versions of the schema had a NOT NULL constraint on the tasks column 
 * for time tracking. This patch simply drops the strict validation.
 */
@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE tiempo MODIFY idTarea BIGINT NULL");
            System.out.println("Successfully altered 'tiempo' table to allow NULL idTarea.");
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE tiempo MODIFY id_tarea BIGINT NULL");
                System.out.println("Successfully altered 'tiempo' table to allow NULL id_tarea.");
            } catch (Exception e2) {
                System.out.println("Notice: Could not alter 'tiempo' table constraint for id_tarea either. (Might already be NULL or absent).");
            }
        }
    }
}
