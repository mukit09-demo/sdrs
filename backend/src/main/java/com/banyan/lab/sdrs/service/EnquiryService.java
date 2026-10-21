package com.banyan.lab.sdrs.service;

import com.banyan.lab.sdrs.dto.EnquiryReceiptResponse;
import com.banyan.lab.sdrs.dto.EnquiryRequest;
import com.banyan.lab.sdrs.dto.EnquiryResponse;
import com.banyan.lab.sdrs.entity.Enquiry;
import com.banyan.lab.sdrs.mapper.EnquiryMapper;
import com.banyan.lab.sdrs.repository.EnquiryRepository;
import java.security.SecureRandom;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The enquiry inbox: one public write, one admin read.
 *
 * <p>Not cached, unlike {@link NewsService}. The content caches pay off because
 * the public site reads them constantly and an editor writes rarely; an inbox
 * inverts that — every public submission would evict it, and the only reader is
 * one operator. A cache here would cost an eviction on the hot path to save a
 * query on the cold one.
 *
 * <p>Both methods are {@code @Transactional} with the mapper called inside, for
 * the reason in {@code AGENTS.md}: {@code open-in-view} is false, so returning
 * an entity and mapping it in the controller would work until something lazy
 * was touched.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnquiryService {

    /**
     * Newest first. The id tiebreaker is not decoration: two enquiries can share
     * a {@code received_at} — the column is microsecond-precision but a batch
     * import or a double submit can still collide — and without it their order
     * would be whatever the database felt like, which makes the inbox reshuffle
     * between reloads.
     */
    private static final Sort NEWEST_FIRST =
            Sort.by(Sort.Direction.DESC, "receivedAt").and(Sort.by(Sort.Direction.DESC, "id"));

    /**
     * Ambiguity-free alphabet: no {@code I}, {@code O}, {@code 0} or {@code 1},
     * because a reference gets read down a phone and typed back in.
     */
    private static final char[] REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int REFERENCE_LENGTH = 6;
    private static final String REFERENCE_PREFIX = "ENQ-";

    /** Collisions are vanishing at 32^6, but "vanishing" is not "never". */
    private static final int REFERENCE_ATTEMPTS = 5;

    private static final SecureRandom RANDOM = new SecureRandom();

    private final EnquiryRepository repository;
    private final EnquiryMapper mapper;

    /** The whole inbox, newest first. Admin-only — see {@code SecurityConfig}. */
    public List<EnquiryResponse> list() {
        return mapper.toResponses(repository.findAll(NEWEST_FIRST));
    }

    /**
     * Stores a submission and returns the receipt.
     *
     * <p>The reference is minted here rather than derived from the id, so it
     * leaks neither how many enquiries exist nor the order they arrived in.
     */
    @Transactional
    public EnquiryReceiptResponse submit(EnquiryRequest request) {
        Enquiry enquiry = mapper.toEntity(request);
        enquiry.setReference(mintReference());
        return mapper.toReceipt(repository.save(enquiry));
    }

    private String mintReference() {
        for (int attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt++) {
            String candidate = randomReference();
            if (!repository.existsByReference(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException(
                "Could not mint a free enquiry reference in %d attempts".formatted(REFERENCE_ATTEMPTS));
    }

    private static String randomReference() {
        StringBuilder reference = new StringBuilder(REFERENCE_PREFIX);
        for (int i = 0; i < REFERENCE_LENGTH; i++) {
            reference.append(REFERENCE_ALPHABET[RANDOM.nextInt(REFERENCE_ALPHABET.length)]);
        }
        return reference.toString();
    }
}
