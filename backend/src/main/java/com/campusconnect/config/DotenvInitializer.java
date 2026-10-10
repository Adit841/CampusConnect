package com.campusconnect.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Initializes application configuration by loading key-value pairs from a local .env file.
 *
 * <p>Ensures that when running locally via {@code mvn spring-boot:run} or from an IDE,
 * database credentials and secrets defined in {@code .env} are automatically populated
 * into Spring's environment and System properties, preventing fallback to unauthenticated
 * localhost defaults.</p>
 */
public class DotenvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(DotenvInitializer.class);

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Map<String, Object> envMap = load();
        if (!envMap.isEmpty()) {
            applicationContext.getEnvironment()
                    .getPropertySources()
                    .addFirst(new MapPropertySource("dotenvProperties", envMap));
        }
    }

    /**
     * Finds and loads key-value pairs from the nearest .env file.
     * Sets matching System properties if not already present in the OS environment.
     *
     * @return Map containing loaded key-value pairs.
     */
    public static Map<String, Object> load() {
        Map<String, Object> map = new HashMap<>();

        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get("backend", ".env"),
                Paths.get("..", ".env"),
                Paths.get("..", "backend", ".env")
        );

        File envFile = null;
        for (Path candidate : candidates) {
            File file = candidate.toFile();
            if (file.exists() && file.isFile()) {
                envFile = file;
                break;
            }
        }

        if (envFile == null) {
            return map;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String value = line.substring(eqIdx + 1).trim();

                    // Strip surrounding quotes
                    if ((value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length() - 1);
                    }

                    map.put(key, value);

                    // Set as System property if not present in OS environment or system properties
                    if (System.getProperty(key) == null && System.getenv(key) == null) {
                        System.setProperty(key, value);
                    }

                    // Alias mapping between SPRING_DATASOURCE_* and legacy DB_* variables
                    if (key.equals("SPRING_DATASOURCE_URL")) {
                        map.putIfAbsent("DB_URL", value);
                        if (System.getProperty("DB_URL") == null && System.getenv("DB_URL") == null) {
                            System.setProperty("DB_URL", value);
                        }
                    } else if (key.equals("DB_URL")) {
                        map.putIfAbsent("SPRING_DATASOURCE_URL", value);
                        if (System.getProperty("SPRING_DATASOURCE_URL") == null && System.getenv("SPRING_DATASOURCE_URL") == null) {
                            System.setProperty("SPRING_DATASOURCE_URL", value);
                        }
                    }

                    if (key.equals("SPRING_DATASOURCE_USERNAME")) {
                        map.putIfAbsent("DB_USERNAME", value);
                        if (System.getProperty("DB_USERNAME") == null && System.getenv("DB_USERNAME") == null) {
                            System.setProperty("DB_USERNAME", value);
                        }
                    } else if (key.equals("DB_USERNAME")) {
                        map.putIfAbsent("SPRING_DATASOURCE_USERNAME", value);
                        if (System.getProperty("SPRING_DATASOURCE_USERNAME") == null && System.getenv("SPRING_DATASOURCE_USERNAME") == null) {
                            System.setProperty("SPRING_DATASOURCE_USERNAME", value);
                        }
                    }

                    if (key.equals("SPRING_DATASOURCE_PASSWORD")) {
                        map.putIfAbsent("DB_PASSWORD", value);
                        if (System.getProperty("DB_PASSWORD") == null && System.getenv("DB_PASSWORD") == null) {
                            System.setProperty("DB_PASSWORD", value);
                        }
                    } else if (key.equals("DB_PASSWORD")) {
                        map.putIfAbsent("SPRING_DATASOURCE_PASSWORD", value);
                        if (System.getProperty("SPRING_DATASOURCE_PASSWORD") == null && System.getenv("SPRING_DATASOURCE_PASSWORD") == null) {
                            System.setProperty("SPRING_DATASOURCE_PASSWORD", value);
                        }
                    }
                }
            }
            log.info("Loaded environment configuration from {}", envFile.getPath());
        } catch (Exception e) {
            log.warn("Failed to load .env file: {}", e.getMessage());
        }

        return map;
    }
}
