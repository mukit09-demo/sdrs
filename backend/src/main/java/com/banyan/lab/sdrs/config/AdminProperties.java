package com.banyan.lab.sdrs.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * The single account allowed to write content.
 *
 * <p>Both fields are {@code @NotBlank} and the type is {@code @Validated}, so
 * an unset {@code SDRS_ADMIN_PASSWORD} stops the application from starting.
 * That is deliberate: the alternative is a backend that boots happily and
 * accepts anonymous writes, which is a worse failure than not booting because
 * nothing reports it.
 *
 * <p>This is not the CMS account store. {@code manage-web} still keeps its
 * users in {@code .data/users.json}; moving them here means an {@code AdminUser}
 * entity and {@code POST /api/auth/login}, and is a later step.
 */
@Validated
@ConfigurationProperties(prefix = "sdrs.admin")
public record AdminProperties(
        @NotBlank(message = "sdrs.admin.username must be set (SDRS_ADMIN_USERNAME)")
        String username,

        @NotBlank(message = "sdrs.admin.password must be set (SDRS_ADMIN_PASSWORD) — "
                + "the API will not start without it, because writes would otherwise be unprotected")
        String password) {}
