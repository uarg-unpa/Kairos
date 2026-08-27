# ── Stage 1: Build stage ──
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar pom.xml y descargar dependencias para aprovechar caché de capas
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copiar código fuente y compilar JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ── Stage 2: Runtime stage ──
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Crear usuario sin privilegios por seguridad
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copiar el ejecutable generado
COPY --from=build /app/target/kairos-*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
