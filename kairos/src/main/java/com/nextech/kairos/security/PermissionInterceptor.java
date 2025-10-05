package com.nextech.kairos.security;

import com.nextech.kairos.util.SessionHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

// 👇 IMPORTS ACTUALIZADOS
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Autowired
    private SessionHelper sessionHelper;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        if (handler instanceof HandlerMethod handlerMethod) {
            PermissionRequired permissionRequired = handlerMethod.getMethodAnnotation(PermissionRequired.class);

            if (permissionRequired != null) {
                HttpSession session = request.getSession(false);

                if (session == null || !sessionHelper.isLoggedIn(session)) {
                    response.sendRedirect("/");
                    return false;
                }

                String requiredPermission = permissionRequired.value();
                if (!sessionHelper.hasPermission(session, requiredPermission)) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN,
                            "No tiene permisos para acceder a esta página. Permiso requerido: " + requiredPermission);
                    return false;
                }
            }
        }

        return true;
    }
}
