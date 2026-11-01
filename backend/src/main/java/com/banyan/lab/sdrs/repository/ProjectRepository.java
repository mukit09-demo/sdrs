package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.Project;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Projects, addressed by slug. {@link JpaSpecificationExecutor} for the market
 * and service filters; {@code findBySlugIn} for the explicit {@code ?slugs=}
 * list.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>,
        JpaSpecificationExecutor<Project> {

    Optional<Project> findBySlug(String slug);

    List<Project> findBySlugIn(Collection<String> slugs);

    boolean existsBySlug(String slug);
}
