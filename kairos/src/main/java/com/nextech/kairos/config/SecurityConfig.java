package com.nextech.kairos.config;

import com.nextech.kairos.jwt.JwtAuthenticationFilter;
import com.nextech.kairos.oauth.CustomOAuth2SuccessHandler;
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

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) 
public class SecurityConfig {

    @Autowired
    private CustomOAuth2SuccessHandler customOAuth2SuccessHandler;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        http
            // 1. Deshabilitar CSRF
            .csrf(csrf -> csrf.disable())
            
            // 2. Configurar CORS (USANDO LAMBDA VACÍA para activar el bean CorsConfigurationSource)
            .cors(cors -> {}) 
            
            // 3. Configurar la gestión de sesión a STATELESS
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 
            
            // 4. Definir URLs permitidas
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/", "/oauth2/**", "/api/auth/loginSuccess", "/login").permitAll()
                .anyRequest().authenticated()
            )
            
            // 5. Configurar OAuth2 Login
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login") 
                .successHandler(customOAuth2SuccessHandler)
            )
            
            // 6. Agregar el filtro de JWT
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); 

        return http.build();
    }

    // --- Bean de Configuración de CORS ---
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permite la URL de tu frontend Angular
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); 
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); 
        
        return source;
    }
}