package com.nextech.kairos.security;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 Authentication Success Handler (equivalent to PHP's redirect after login)
 */
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
private AuthService authService;

@Autowired
private SessionHelper sessionHelper;

    
    @Override
public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                    Authentication authentication) throws IOException, ServletException {
    
    if (response.isCommitted()) {
        return;
    }

    CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();

    try {
        // 1. Obtener usuario del sistema
        Usuario usuario = authService.processGoogleLogin(oauth2User.getEmail(), oauth2User.getName());

        // 2. Guardar usuario en sesión (para que funcione tu SessionHelper)
        HttpSession session = request.getSession();
        sessionHelper.setUsuarioInSession(session, usuario);

        // 3. Generar token JWT (opcional si querés usarlo desde JS o API)
        String token = jwtUtil.generateToken(oauth2User.getEmail(), oauth2User.getAuthorities());

        // 4. Guardar token en cookie
        Cookie jwtCookie = new Cookie("JWT_TOKEN", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 60 * 24); // 1 día

        response.addCookie(jwtCookie);

        // 5. Redirigir al panel principal
        getRedirectStrategy().sendRedirect(request, response, "/usuarios");

    } catch (Exception e) {
        // Manejo de error: por ejemplo, redirigir con mensaje de error o loggear
        e.printStackTrace();
        response.sendRedirect("/?error=google_login_failed");
    }
}


}
