package com.banyan.lab.sdrs.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import tools.jackson.databind.jsontype.PolymorphicTypeValidator;

@Configuration
@EnableCaching
public class CacheConfig {

    private static final PolymorphicTypeValidator CACHEABLE_TYPES =
            BasicPolymorphicTypeValidator.builder()
                    // Our own DTOs — the actual cached values.
                    .allowIfSubType("com.banyan.lab.sdrs.")
                    // The collections and dates they are made of.
                    .allowIfSubType("java.util.")
                    .allowIfSubType("java.time.")
                    // Spring's placeholder for a cached null.
                    .allowIfSubType("org.springframework.cache.support.NullValue")
                    .build();

    private static RedisSerializer<Object> valueSerializer() {
        return GenericJacksonJsonRedisSerializer.builder()
                .enableDefaultTyping(CACHEABLE_TYPES)
                .enableSpringCacheNullValueSupport()
                .build();
    }

    /**
     * Cache-aside with a 24-hour TTL. Every write through the API evicts its
     * collection after commit (see {@link #transactionAwareCaches}), so an edit
     * normally shows up on the next read. The TTL is only the backstop, and an
     * updated value can take up to 24 hours to appear in two cases:
     *
     * <ul>
     *   <li>The database was changed behind the API's back — {@code psql}, a
     *       Liquibase seed — so nothing evicted the cache.
     *   <li>A read that loaded the old row just before an edit committed wrote
     *       it to Redis just after the eviction. The window is about a
     *       millisecond, so this is rare, but nothing removes that entry until
     *       the TTL or the next write to the same collection.
     * </ul>
     *
     * <p>Either way, saving the item again in the CMS, or deleting the
     * {@code sdrs:<cache>::*} keys in Redis, clears it. If the second case
     * starts happening, the fix is a delayed second eviction about a second
     * after commit, not a shorter TTL.
     */
    @Bean
    public RedisCacheConfiguration redisCacheConfiguration(
            @Value("${sdrs.cache.ttl:24h}") Duration ttl) {

        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .prefixCacheNameWith("sdrs:")
                .serializeKeysWith(SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(SerializationPair.fromSerializer(valueSerializer()));
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer transactionAwareCaches() {
        return RedisCacheManager.RedisCacheManagerBuilder::transactionAware;
    }
}
