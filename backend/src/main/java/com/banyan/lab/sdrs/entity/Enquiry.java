package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
        name = "enquiry",
        uniqueConstraints = @UniqueConstraint(name = "uk_enquiry_reference", columnNames = "reference"))
@Getter
@Setter
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "enquiry_id_generator")
    @SequenceGenerator(
            name = "enquiry_id_generator", sequenceName = "enquiry_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /** The reference quoted back to the visitor, e.g. {@code ENQ-M1X2Y3}. */
    @NotBlank
    @Size(max = 40)
    @Column(name = "reference", length = 40, nullable = false, updatable = false)
    private String reference;

    @NotBlank
    @Size(max = 200)
    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @NotBlank
    @Email
    @Size(max = 200)
    @Column(name = "email", length = 200, nullable = false)
    private String email;

    @Size(max = 200)
    @Column(name = "organisation", length = 200)
    private String organisation;

    @NotBlank
    @Size(max = 120)
    @Column(name = "topic", length = 120, nullable = false)
    private String topic;

    @NotBlank
    @Column(name = "message", nullable = false, columnDefinition = "text")
    private String message;

    @CreationTimestamp
    @Column(name = "received_at", nullable = false, updatable = false)
    private Instant receivedAt;
}
