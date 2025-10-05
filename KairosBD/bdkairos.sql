drop database if exists bdkairos; 
create database if not exists bdkairos;
use bdkairos;

-- 1. Tabla ROL (antes perfil)
create table if not exists rol (
    id_rol int not null auto_increment,
    nombre varchar(30) not null unique, -- Añadir UNIQUE para evitar duplicados
    primary key (id_rol)
);

-- 2. Tabla USUARIO (está bien)
create table if not exists usuario (
    id_usuario int not null auto_increment,
    nombre varchar(30) not null,
    email varchar(64) not null unique, -- Añadir UNIQUE para el login por email
    primary key (id_usuario)
);

-- 3. Tabla de VINCULACIÓN USUARIO-ROL (antes usuario_perfil)
create table if not exists usuario_rol (
    id_usuario int not null,
    id_rol int not null,
    primary key (id_usuario, id_rol),
    constraint fk_ur_rol foreign key (id_rol) references rol (id_rol) ON DELETE NO ACTION ON UPDATE NO ACTION,
    constraint fk_ur_usuario foreign key (id_usuario) references usuario (id_usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- 4. Tabla de PERMISO (¡FALTABA!)
create table if not exists permiso (
    id_permiso int not null auto_increment,
    nombre varchar(50) not null unique,
    primary key (id_permiso)
);

-- 5. Tabla de VINCULACIÓN ROL-PERMISO (¡FALTABA!)
create table if not exists rol_permiso (
    id_rol int not null,
    id_permiso int not null,
    primary key (id_rol, id_permiso),
    constraint fk_rp_rol foreign key (id_rol) references rol (id_rol) ON DELETE NO ACTION ON UPDATE NO ACTION,
    constraint fk_rp_permiso foreign key (id_permiso) references permiso (id_permiso) ON DELETE NO ACTION ON UPDATE NO ACTION
);