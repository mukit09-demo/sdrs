package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A film and the line that says what it shows — the home page's, and each
 * market's.
 *
 * <p>Deliberately flat, rather than embedding {@link MediaImage} for the poster
 * inside an embedded {@code MediaVideo}. Nesting would be a truer mirror of the
 * TypeScript shape, but {@link MediaImage} fixes its columns as
 * {@code image_url} / {@code image_alt} / {@code image_seed}, and a table that
 * has both an image and a film poster would collide on all three — fixable only
 * with a block of {@code @AttributeOverride}s per owning entity, repeated and
 * silently wrong if one is missed. The mapper reassembles the nested
 * {@code Film} / {@code MediaVideo} / {@code MediaImage} for the wire, which is
 * the layer whose job that is.
 *
 * <p>Every field is nullable: a market without a film simply skips the band, and
 * an all-null embeddable reads back as null.
 */
@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Film {

    /** Direct file URL (MP4/WebM), self-hosted or from a CDN. */
    @Size(max = 600)
    @Column(name = "film_video_url", length = 600)
    private String videoUrl;

    /** Player URL for a platform embed. Used when {@code videoUrl} is absent. */
    @Size(max = 600)
    @Column(name = "film_video_embed_url", length = 600)
    private String videoEmbedUrl;

    @Size(max = 300)
    @Column(name = "film_video_alt", length = 300)
    private String videoAlt;

    /** WebVTT captions track. Expected for anything with speech. */
    @Size(max = 600)
    @Column(name = "film_video_captions_url", length = 600)
    private String videoCaptionsUrl;

    /** Still frame, shown before playback and in place of missing footage. */
    @Size(max = 600)
    @Column(name = "film_poster_url", length = 600)
    private String posterUrl;

    @Size(max = 300)
    @Column(name = "film_poster_alt", length = 300)
    private String posterAlt;

    @Size(max = 160)
    @Column(name = "film_poster_seed", length = 160)
    private String posterSeed;

    /** One line placed under the film, saying what it shows. */
    @Size(max = 600)
    @Column(name = "film_caption", length = 600)
    private String caption;
}
