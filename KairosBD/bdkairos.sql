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
    email varchar(64) not null unique,
    id_rol int not null, -- relación directa
    primary key (id_usuario),
    constraint fk_usuario_rol foreign key (id_rol) references rol (id_rol)
);

-- 4. Tabla de PERMISO 
create table if not exists permiso (
    id_permiso int not null auto_increment,
    nombre varchar(50) not null unique,
    primary key (id_permiso)
);

-- 5. Tabla de VINCULACIÓN ROL-PERMISO (M:N)
create table if not exists rol_permiso (
    id_rol int not null,
    id_permiso int not null,
    primary key (id_rol, id_permiso),
    constraint fk_rp_rol foreign key (id_rol) references rol (id_rol),
    constraint fk_rp_permiso foreign key (id_permiso) references permiso (id_permiso)
);