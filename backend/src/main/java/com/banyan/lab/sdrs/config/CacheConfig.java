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
                    .allowIfSubType("com.banyan.lab.sdrs.")
                    .allowIfSubType("java.util.")
                    .allowIfSubType("java.time.")
                    .allowIfSubType("org.springframework.cache.support.NullValue")
                    .build();

    private static RedisSerializer<Object> valueSerializer() {
        return GenericJacksonJsonRedisSerializer.builder()
                .enableDefaultTyping(CACHEABLE_TYPES)
                .enableSpringCacheNullValueSupport()
                .build();
    }

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
