-- Tabla Proyecto
CREATE TABLE Proyecto (
    idProyecto INT PRIMARY KEY,
    equipo VARCHAR(255),
    fechaCreacion DATE,
    estado VARCHAR(50),
    nombre VARCHAR(255)
);

-- Tabla Etapa
CREATE TABLE Etapa (
    idEtapa INT PRIMARY KEY,
    idProyecto INT,
    nombre VARCHAR(255),
    fechaInicio DATE,
    fechaFin DATE,
    CONSTRAINT fk_Etapa_Proyecto FOREIGN KEY (idProyecto) 
        REFERENCES Proyecto(idProyecto)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla Iteracion
CREATE TABLE Iteracion (
    idIteracion INT PRIMARY KEY,
    idEtapa INT,
    numero INT,
    descripcion TEXT,
    fechaInicio DATE,
    fechaFin DATE,
    CONSTRAINT fk_Iteracion_Etapa FOREIGN KEY (idEtapa)
        REFERENCES Etapa(idEtapa)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla Usuario
CREATE TABLE Usuario (
    idUsuario INT PRIMARY KEY,
    nombre VARCHAR(255),
    rolProyecto VARCHAR(100),
    correo VARCHAR(255)
);

-- Tabla Rol
CREATE TABLE Rol (
    idRol INT PRIMARY KEY,
    nombreRol VARCHAR(100)
);

-- Tabla Usuario_Proyecto
CREATE TABLE Usuario_Proyecto (
    idUsuario INT,
    idProyecto INT,
    rolProyecto VARCHAR(100),
    PRIMARY KEY (idUsuario, idProyecto),
    CONSTRAINT fk_UsuarioProyecto_Usuario FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_UsuarioProyecto_Proyecto FOREIGN KEY (idProyecto)
        REFERENCES Proyecto(idProyecto)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla Tarea
CREATE TABLE Tarea (
    idTarea INT PRIMARY KEY,
    idIteracion INT,
    idUsuario INT,
    estado VARCHAR(50),
    descripcion TEXT,
    fechaCreacion DATE,
    prioridad VARCHAR(50),
    fechaFin DATE,
    nombre VARCHAR(255),
    CONSTRAINT fk_Tarea_Iteracion FOREIGN KEY (idIteracion)
        REFERENCES Iteracion(idIteracion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_Tarea_Usuario FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Tabla Comentario
CREATE TABLE Comentario (
    idComentario INT PRIMARY KEY,
    idTarea INT,
    idUsuario INT,
    fechaComentario DATE,
    contenido TEXT,
    CONSTRAINT fk_Comentario_Tarea FOREIGN KEY (idTarea)
        REFERENCES Tarea(idTarea)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_Comentario_Usuario FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Tabla Tiempo
CREATE TABLE Tiempo (
    idTiempo INT PRIMARY KEY,
    idUsuario INT,
    idTarea INT,
    duracion INT,
    fechaRegistro DATE,
    CONSTRAINT fk_Tiempo_Usuario FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_Tiempo_Tarea FOREIGN KEY (idTarea)
        REFERENCES Tarea(idTarea)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla Categoria
CREATE TABLE Categoria (
    idCategoria INT PRIMARY KEY,
    idProyecto INT,
    nombre VARCHAR(255),
    descripcion TEXT,
    CONSTRAINT fk_Categoria_Proyecto FOREIGN KEY (idProyecto)
        REFERENCES Proyecto(idProyecto)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla Categoria_Tarea
CREATE TABLE Categoria_Tarea (
    idCategoria INT,
    idTarea INT,
    PRIMARY KEY (idCategoria, idTarea),
    CONSTRAINT fk_CategoriaTarea_Categoria FOREIGN KEY (idCategoria)
        REFERENCES Categoria(idCategoria)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_CategoriaTarea_Tarea FOREIGN KEY (idTarea)
        REFERENCES Tarea(idTarea)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla Reporte
CREATE TABLE Reporte (
    idReporte INT PRIMARY KEY,
    idProyecto INT,
    fechaReporte DATE,
    formato VARCHAR(50),
    CONSTRAINT fk_Reporte_Proyecto FOREIGN KEY (idProyecto)
        REFERENCES Proyecto(idProyecto)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Dependencia_Tarea (
    idTarea INT,            -- La tarea que depende
    idTareaDepende INT,     -- La tarea de la que depende
    PRIMARY KEY (idTarea, idTareaDepende),
    CONSTRAINT fk_Dependencia_Tarea FOREIGN KEY (idTarea)
        REFERENCES Tarea(idTarea)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_Dependencia_TareaDepende FOREIGN KEY (idTareaDepende)
        REFERENCES Tarea(idTarea)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
