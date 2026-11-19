package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.NewsArticle;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsRepository extends JpaRepository<NewsArticle, Long>,
        JpaSpecificationExecutor<NewsArticle> {

    Optional<NewsArticle> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
