package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.Service;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Services, addressed by slug. {@code findBySlugIn} is for resolving the slugs a
 * project names.
 */
@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findBySlug(String slug);

    List<Service> findBySlugIn(Collection<String> slugs);

    boolean existsBySlug(String slug);
}
