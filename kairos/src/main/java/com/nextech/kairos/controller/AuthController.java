package com.nextech.kairos.controller;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/login/success")
    public String loginSuccess(OAuth2AuthenticationToken authentication) {
        return "Usuario autenticado: " + authentication.getPrincipal().getAttributes();
    }
}
