package com.banyan.lab.sdrs.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import tools.jackson.databind.jsontype.PolymorphicTypeValidator;

/**
 * Redis as the read cache.
 *
 * <p>Values are JSON, not JDK serialization. Two reasons: the DTOs are records
 * and would all have to implement {@code Serializable} otherwise, and a cache
 * you cannot read with {@code redis-cli GET} is a cache you cannot debug.
 *
 * <p>{@code @EnableCaching} lives here rather than on the application class on
 * purpose. It makes the caching aspect require a {@code CacheManager}, and the
 * only thing that supplies one is this class — so annotating the application
 * meant every sliced test that loaded it (a {@code @WebMvcTest} slice, say)
 * failed with "no CacheManager available" despite having nothing to do with
 * caching. Keeping the switch beside the bean it depends on means a context
 * either has both or neither.
 *
 * <p>Three things about the serializer that are easy to get wrong.
 *
 * <p>The class name has no digit — Spring Data Redis 4 deprecated
 * {@code GenericJackson2JsonRedisSerializer} for removal when Spring Boot 4
 * moved to Jackson 3, and the replacement drops the version rather than bumping
 * it to 3. It also has no no-arg constructor: the Jackson 3 variant takes an
 * {@code ObjectMapper} or comes from {@code builder()}.
 *
 * <p>And {@code builder().build()} is <em>not</em> equivalent to the old no-arg
 * constructor, which is the one that bites. The old one enabled default typing;
 * the builder does not, so values serialise to plain JSON with no type
 * information and come back as {@code LinkedHashMap} — a
 * {@code ClassCastException} on the second read of anything, while the first
 * read works fine because it never touched the cache. Hence
 * {@link #CACHEABLE_TYPES} and {@code enableDefaultTyping}.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * What may be reconstructed from a type id found in Redis.
     *
     * <p>Default typing writes the class name into the cached JSON, so without
     * a validator anything on the classpath could be instantiated from whatever
     * is in the cache. {@code enableUnsafeDefaultTyping()} exists on the
     * builder and is the one-line version of this; an allowlist costs four
     * lines and means a compromised or merely shared Redis cannot turn a cache
     * read into arbitrary object construction.
     */
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

    /**
     * Defaults to five minutes to match {@code CONTENT_REVALIDATE_SECONDS=300}
     * in both apps' {@code .env.example}. If the two disagree, the longer one
     * silently wins and an edit appears to take longer to show up than
     * whichever number you were looking at.
     */
    private static RedisSerializer<Object> valueSerializer() {
        return GenericJacksonJsonRedisSerializer.builder()
                .enableDefaultTyping(CACHEABLE_TYPES)
                .enableSpringCacheNullValueSupport()
                .build();
    }

    @Bean
    public RedisCacheConfiguration redisCacheConfiguration(
            @Value("${sdrs.cache.ttl:5m}") Duration ttl) {

        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .prefixCacheNameWith("sdrs:")
                .serializeKeysWith(SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(SerializationPair.fromSerializer(valueSerializer()));
    }
}
