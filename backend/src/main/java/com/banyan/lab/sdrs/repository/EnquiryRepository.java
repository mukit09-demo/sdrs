package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

    boolean existsByReference(String reference);
}
