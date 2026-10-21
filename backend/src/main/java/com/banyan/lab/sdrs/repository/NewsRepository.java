package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.NewsArticle;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Articles.
 *
 * <p>Keyed on a surrogate {@code Long}, but addressed by slug: every caller has
 * a slug, never an id, because the slug is what the URL and the CMS carry. The
 * {@code *BySlug} methods are the real entry points — {@code findById} exists
 * only because {@link JpaRepository} declares it.
 *
 * <p>{@link JpaSpecificationExecutor} because the tag and exclude filters
 * belong in the query. The mock repository filters in memory because it is
 * reading a JSON file; this is a database, and loading every row to throw most
 * of them away would be a choice rather than a constraint.
 */
@Repository
public interface NewsRepository extends JpaRepository<NewsArticle, Long>,
        JpaSpecificationExecutor<NewsArticle> {

    Optional<NewsArticle> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
