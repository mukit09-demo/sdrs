package com.banyan.lab.sdrs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The SDRS content API — the backend {@code core-web} and {@code manage-web}
 * point at when {@code NEXT_PUBLIC_CONTENT_SOURCE=api}.
 *
 * <p>Currently serves news. The remaining collections (markets, services,
 * projects, vacancies) follow the same five files per entity: entity, DTO,
 * mapper, repository + service, controller.
 */
@SpringBootApplication
public class SdrsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SdrsApiApplication.class, args);
    }
}
