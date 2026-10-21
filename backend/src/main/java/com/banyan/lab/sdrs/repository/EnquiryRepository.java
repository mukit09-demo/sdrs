package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * The enquiry inbox.
 *
 * <p>No {@code JpaSpecificationExecutor} and no {@code findByReference}: the
 * inbox is read whole and newest-first, and nothing addresses a single enquiry
 * — there is no detail route and no edit. {@code existsByReference} is here for
 * the one write, to make the minted reference collision-checkable.
 *
 * <p>{@link Enquiry} holds no collections, so none of the {@code @BatchSize}
 * care the content entities need applies here.
 */
@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

    boolean existsByReference(String reference);
}
