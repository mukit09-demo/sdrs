package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.banyan.lab.sdrs.entity.NewsType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * What the CMS sends to {@code POST /api/articles} and
 * {@code PUT /api/articles/{slug}} — the same shape it reads, because the admin
 * form submits the whole entity either way.
 *
 * <p>Validation lives here rather than only on the entity so a bad payload is
 * a 400 describing the field, not a constraint violation from the flush at the
 * end of the transaction.
 */
public record ArticleRequest(
        @NotBlank
        @Size(max = 160)
        @Pattern(
                regexp = "[a-z0-9]+(?:-[a-z0-9]+)*",
                message = "must be lower-case words separated by single hyphens")
        String slug,

        @NotBlank @Size(max = 300) String title,

        @NotBlank @Size(max = 1000) String excerpt,

        @NotEmpty(message = "must have at least one paragraph")
        List<@NotBlank String> body,

        @NotNull NewsType category,

        @NotNull
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate publishedAt,

        @Positive int readingMinutes,

        @NotNull @Valid AuthorDto author,

        @NotNull @Valid MediaImageDto image,

        @NotNull List<@NotBlank @Size(max = 120) String> tags) {}
