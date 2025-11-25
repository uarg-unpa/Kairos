package com.nextech.kairos.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nextech.kairos.security.JwtAuthenticationEntryPoint;
import com.nextech.kairos.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    // OAuth2 login deshabilitado: usamos flujo token-exchange en /auth/google

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            .authorizeHttpRequests(authz -> authz
                // Recursos públicos comunes
                .requestMatchers(
                    "/", 
                    "/error", 
                    "/favicon.ico",
                    "/static/**", //recursos estáticos están en /static/
                    "/css/**", "/js/**", "/images/**" //faltan agregar según avance el proyecto
                ).permitAll()
                // Endpoints públicos
                .requestMatchers("/auth/**").permitAll()
                // Endpoints protegidos por permisos
                //.requestMatchers("/api/usuarios/**").hasAnyAuthority("Usuarios", "ROLE_ADMINISTRADOR")
                .requestMatchers("/api/roles/**").hasAnyAuthority("Roles", "ROLE_ADMINISTRADOR")
                .requestMatchers("/api/permisos/**").hasAnyAuthority("Permisos", "ROLE_ADMINISTRADOR")
                // Todo lo demás necesita autenticación
                .anyRequest().permitAll()
            );

        // Filtro JWT
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
