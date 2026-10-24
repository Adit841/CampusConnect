# ---- Build the React frontend ----
FROM node:22-alpine AS frontend
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# Same-origin paths: the backend serves both the website and the API.
ENV VITE_API_BASE_URL=/api
ENV VITE_WS_BASE_URL=/ws/sockjs
RUN npm run build

# ---- Build the Spring Boot backend (with the frontend bundled in) ----
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /backend

COPY backend/pom.xml .
RUN mvn -B -q dependency:go-offline

COPY backend/src ./src
COPY --from=frontend /frontend/dist ./src/main/resources/static
# Keep the Maven heap down so Render's Docker build does not get OOM-killed.
ENV MAVEN_OPTS="-Xmx768m"
RUN mvn -B -q package -DskipTests

# ---- Run ----
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=backend /backend/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
