# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot Backend
FROM maven:3.9.4-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
# Copy the built frontend static files into the backend's static resources directory
COPY --from=frontend-build /app/frontend/dist /app/backend/src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
