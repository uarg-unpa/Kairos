package com.nextech.kairos.security;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    @Autowired
    private AuthService authService;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException("Error processing OAuth2 user: " + ex.getMessage());
        }
    }
    
    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        // Extract user info from Google OAuth2 response
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }
        
        // Create or update user (equivalent to PHP's auto-registration)
        Usuario usuario = authService.authenticateWithGoogle(name, email);
        
        // Check if user has system access
        if (!authService.hasSystemAccess(email)) {
            throw new OAuth2AuthenticationException("User does not have system access");
        }
        
        // Return custom OAuth2User with additional user info
        return new CustomOAuth2User(oauth2User, usuario);
    }
}
