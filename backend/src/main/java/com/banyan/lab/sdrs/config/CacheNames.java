package com.banyan.lab.sdrs.config;

/** Cache names, in one place so a {@code @Cacheable} and a {@code @CacheEvict} cannot drift apart. */
public final class CacheNames {

    /** Article lists, keyed on the tag / exclude / limit triple. */
    public static final String ARTICLES = "articles";

    /** Single articles, keyed on slug. */
    public static final String ARTICLE = "article";

    public static final String MARKETS = "markets";
    public static final String MARKET = "market";

    public static final String SERVICES = "services";
    public static final String SERVICE = "service";

    /** Project lists, keyed on the market / service / slugs / limit quadruple. */
    public static final String PROJECTS = "projects";
    public static final String PROJECT = "project";

    /** The candidate-facing openings. The admin job reads are not cached. */
    public static final String OPENINGS = "openings";

    private CacheNames() {}
}
