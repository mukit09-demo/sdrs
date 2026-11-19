package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.Market;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findBySlug(String slug);

    List<Market> findBySlugIn(Collection<String> slugs);

    boolean existsBySlug(String slug);
}
