INSERT INTO rol (nombre) VALUES ('Administrador'), ('Miembro');
INSERT INTO permiso (nombre) VALUES ('USUARIO_CREAR'), ('USUARIO_EDITAR');
INSERT INTO rol_permiso (id_rol, id_permiso) VALUES (1, 1), (1, 2);
