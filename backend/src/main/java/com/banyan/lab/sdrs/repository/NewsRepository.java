package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Articles, keyed by slug.
 *
 * <p>{@link JpaSpecificationExecutor} because the tag and exclude filters
 * belong in the query. The mock repository filters in memory because it is
 * reading a JSON file; this is a database, and loading every row to throw most
 * of them away would be a choice rather than a constraint.
 */
@Repository
public interface NewsRepository extends JpaRepository<NewsArticle, String>,
        JpaSpecificationExecutor<NewsArticle> {
}
