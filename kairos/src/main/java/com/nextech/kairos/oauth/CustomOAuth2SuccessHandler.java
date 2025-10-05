package com.nextech.kairos.oauth;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component // Importante: Spring debe gestionarla como un Bean
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    // URL base de tu aplicación Angular
    private static final String REDIRECT_URI_BASE = "http://localhost:4200/auth/callback"; 

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        
        // 1. La respuesta con el JWT ya está en la sesión temporal. La capturamos.
        // Asumimos que el AuthController generó el JWT y lo puso como atributo de la solicitud antes de llamar a este handler.
        // **NOTA:** Esto es un flujo simplificado. En un flujo REST ideal, el AuthController devolvería el JWT directamente.

        // Dado que el flujo de Spring Security forzó la llamada a AuthController.loginSuccess, 
        // necesitamos obtener el objeto LoginResponse que se devolvió.

        // Por ahora, y para simplificar, redirigiremos al endpoint que sí devuelve el JWT.
        // La forma más limpia en un entorno SPA es evitar este Handler y usar un controlador de "proxy".

        // En Spring Security moderno, si el éxito ocurre en un endpoint REST, el controller se ejecuta
        // y este handler solo se usa para redireccionar.

        // Usaremos la URL original de éxito de Google para obtener el token, que es el objetivo final.
        String targetUrl = UriComponentsBuilder.fromUriString(REDIRECT_URI_BASE)
                .queryParam("token", "TEMP_TOKEN_PLACEHOLDER") // Usaremos un placeholder, ya que el token se generó en AuthController
                .build().toUriString();
        
        // El verdadero JWT debe ser recuperado del proceso de autenticación.
        // Para que esto funcione, en el AuthController o un filtro previo, DEBES guardar el JWT en algún lado (ej. un servicio temporal o una cookie).
        
        // **SOLUCIÓN SIMPLE:** Redirigimos al Front-end para que llame a un endpoint /api/auth/token que devuelva el token.
        // Sin embargo, para cumplir con el flujo que definiste:
        
        // Asumiremos que el JWT generado en AuthController se puede acceder.
        // Si no se puede, es mejor que tu AuthController sea el successHandler.

        // **USAMOS EL FLUJO DE COOKIE/REDIRECCIÓN (más seguro para SPA):**
        // Si tu AuthController hubiera guardado el JWT en una Cookie:
        // response.addCookie(new Cookie("jwt", "EL_TOKEN_GENERADO"));
        // targetUrl = "http://localhost:4200/home";
        
        // Usando el flujo simplificado de query param (menos seguro, pero fácil de implementar):
        // Esto requiere que modifiques la redirección en tu AuthController para que el JWT esté disponible.

        // Debido a que el flujo con handler es complejo con JWT, aquí está la redirección simple, asumiendo que el JWT se obtendrá de otra manera:
        // **ESTO LO REDIRIGE AL CALLBACK DE ANGULAR PARA QUE ANGULAR COMPLETE EL PROCESO**
        response.sendRedirect(REDIRECT_URI_BASE);
    }
}