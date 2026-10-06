package com.banyan.lab.sdrs.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Public reads, authenticated writes.
 *
 * <p>{@code core-web} is a public website with no credential to present, so the
 * GETs have to be open — this API is only ever as private as the network it is
 * on. The writes come from {@code manage-web} server-side, which can hold a
 * secret.
 *
 * <p>Stateless with CSRF disabled, which is correct here and would not be for a
 * browser session: there is no cookie to ride on. The credential is an
 * {@code Authorization} header the caller has to construct deliberately, which
 * is the thing CSRF protection exists to prevent happening by accident.
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(AdminProperties.class)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Admin reads, before the public GET rule below — the
                        // first matcher wins, so this ordering *is* the access
                        // control. The CMS listings live here because they show
                        // what the public list filters out: draft and withdrawn
                        // jobs. A draft vacancy is not a secret, but it is also
                        // not published, and /api/** being blanket-public would
                        // publish it.
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Reads: anyone. This is the public site's content, and
                        // the candidate-facing job list.
                        .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        // Writes: the admin account, and nothing else.
                        .requestMatchers("/api/**").hasRole("ADMIN")
                        // Everything else — the rest of /actuator included — is
                        // closed by default rather than open by omission.
                        .anyRequest().denyAll())
                .httpBasic(Customizer.withDefaults())
                .build();
    }

    /**
     * The admin account, hashed at startup so the plaintext from the
     * environment is never held in the user store.
     */
    @Bean
    public UserDetailsService userDetailsService(AdminProperties admin, PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(
                User.withUsername(admin.username())
                        .password(encoder.encode(admin.password()))
                        .roles("ADMIN")
                        .build());
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
