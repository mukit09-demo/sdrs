package com.banyan.lab.sdrs.config;

/** Cache names, in one place so a {@code @Cacheable} and a {@code @CacheEvict} cannot drift apart. */
public final class CacheNames {

    /** Article lists, keyed on the tag / exclude / limit triple. */
    public static final String ARTICLES = "articles";

    /** Single articles, keyed on slug. */
    public static final String ARTICLE = "article";

    private CacheNames() {}
}
