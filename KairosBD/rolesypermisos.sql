USE bdkairos;

-- Crear roles (ahora 'rol' existe)
INSERT INTO rol (nombre) VALUES ('Administrador') 
ON DUPLICATE KEY UPDATE nombre=nombre;

INSERT INTO rol (nombre) VALUES ('Miembro') 
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Crear permisos (ahora 'permiso' existe)
INSERT INTO permiso (nombre) VALUES ('Usuarios') 
ON DUPLICATE KEY UPDATE nombre=nombre;
-- ... [resto de tus INSERTs de permisos] ...

-- Asignar permisos al Administrador (ahora 'rol_permiso' existe)
INSERT IGNORE INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
JOIN permiso p
WHERE r.nombre = 'Administrador';

-- Ejemplo de usuario de prueba con rol Administrador
INSERT INTO usuario (nombre, email) 
VALUES ('Valeria Centurion', 'centurionvaleria6@mail.com')
-- Usar email para la actualización, ya que nombre+email es único, pero email es la clave de login
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre); 

-- Asignar rol Administrador al usuario (si no lo tiene ya)
INSERT IGNORE INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuario u
JOIN rol r ON r.nombre = 'Administrador'
WHERE u.email = 'centurionvaleria6@mail.com';