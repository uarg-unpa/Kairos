package com.nextech.kairos.controller;
import com.nextech.kairos.dto.AuthResponse;
import com.nextech.kairos.dto.GoogleTokenRequest;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import java.lang.reflect.Field;
import java.util.Optional;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;





@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private AuthController controller;

    @Mock
    private AuthService authService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() throws Exception {
        controller = new AuthController();

        // inject mocks into controller via reflection
        setField(controller, "authService", authService);
        setField(controller, "jwtUtil", jwtUtil);
        setField(controller, "googleClientId", "test-client-id");

        // set up SecurityContext to use our authentication mock
        SecurityContext context = mock(SecurityContext.class);
        lenient().when(context.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(context);
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, value);
    }

    private void setPrincipal(String principal) {
        lenient().when(authentication.getPrincipal()).thenReturn(principal);
    }

    @Test
    void getCurrentUser_whenUserPresent_returnsUserInfo() {
        String email = "user@example.com";
        setPrincipal(email);

        Usuario usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(42L);
        when(usuario.getNombre()).thenReturn("Test User");
        when(usuario.getEmail()).thenReturn(email);

        when(authService.getUserForSession(email)).thenReturn(Optional.of(usuario));
        when(authService.getUserPermissionsForSession(email)).thenReturn(Set.of("PERM_A", "PERM_B"));
        when(authService.isAdmin(email)).thenReturn(true);

        ResponseEntity<?> resp = controller.getCurrentUser();
        assertEquals(200, resp.getStatusCodeValue());
        assertNotNull(resp.getBody());
        // body is UserInfoResponse; verify some fields via toString/introspection not available -> cast
        var body = resp.getBody();
        assertTrue(body.toString().contains("Test User"));
    }

    @Test
    void getCurrentUser_whenUserMissing_returnsNotFound() {
        String email = "nouser@example.com";
        setPrincipal(email);

        when(authService.getUserForSession(email)).thenReturn(Optional.empty());

        ResponseEntity<?> resp = controller.getCurrentUser();
        assertEquals(404, resp.getStatusCodeValue());
    }

    @Test
    void checkPermission_returnsValueFromService() {
        String email = "perm@example.com";
        setPrincipal(email);

        when(authService.hasPermission(email, "SOME_PERMISSION")).thenReturn(true);

        ResponseEntity<Boolean> resp = controller.checkPermission("SOME_PERMISSION");
        assertEquals(200, resp.getStatusCodeValue());
        assertTrue(resp.getBody());
    }

    @Test
    void isAdmin_returnsValueFromService() {
        String email = "admin@example.com";
        setPrincipal(email);

        when(authService.isAdmin(email)).thenReturn(false);

        ResponseEntity<Boolean> resp = controller.isAdmin();
        assertEquals(200, resp.getStatusCodeValue());
        assertFalse(resp.getBody());
    }

    @Test
    void logout_returnsSuccessfulMessage() {
        ResponseEntity<?> resp = controller.logout();
        assertEquals(200, resp.getStatusCodeValue());
        assertNotNull(resp.getBody());
        assertTrue(resp.getBody().toString().contains("Logout successful"));
    }

    @Test
    void googleTokenExchange_whenBodyNull_returnsBadRequest() {
        ResponseEntity<AuthResponse> resp = controller.googleTokenExchange(null);
        assertEquals(400, resp.getStatusCodeValue());
        assertNotNull(resp.getBody());
        assertEquals("idToken es requerido", resp.getBody().getMessage());
    }

    @Test
    void googleTokenExchange_whenIdTokenBlank_returnsBadRequest() {
        GoogleTokenRequest req = new GoogleTokenRequest();
        req.setIdToken("   ");
        ResponseEntity<AuthResponse> resp = controller.googleTokenExchange(req);
        assertEquals(400, resp.getStatusCodeValue());
        assertNotNull(resp.getBody());
        assertEquals("idToken es requerido", resp.getBody().getMessage());
    }
}