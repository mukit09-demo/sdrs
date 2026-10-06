package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * A submitted contact-form enquiry — what {@code POST /api/enquiries} stores.
 *
 * <p>The only table written by an unauthenticated caller, which is why it holds
 * no relations and nothing derived: it is an inbox, not content. The reference
 * is the id, because that is what the form shows the visitor afterwards.
 *
 * <p>No {@code updated_at}: an enquiry is never edited.
 */
@Entity
@Table(name = "enquiry")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enquiry {

    /** The reference quoted back to the visitor, e.g. {@code ENQ-M1X2Y3}. */
    @Id
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

    /**
     * Matches one of the topic values on the contact page, which are code-edited
     * in {@code packages/shared/data/contact.ts} rather than stored here. Kept as
     * free text for that reason: validating against a list this database does not
     * hold would be a lie.
     */
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
