package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
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
