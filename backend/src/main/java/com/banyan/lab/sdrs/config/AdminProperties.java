package com.banyan.lab.sdrs.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "sdrs.admin")
public record AdminProperties(
        @NotBlank(message = "sdrs.admin.username must be set (SDRS_ADMIN_USERNAME)")
        String username,

        @NotBlank(message = "sdrs.admin.password must be set (SDRS_ADMIN_PASSWORD) — "
                + "the API will not start without it, because writes would otherwise be unprotected")
        String password) {}
