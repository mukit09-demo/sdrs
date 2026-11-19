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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnquiryService {

    private static final Sort NEWEST_FIRST =
            Sort.by(Sort.Direction.DESC, "receivedAt").and(Sort.by(Sort.Direction.DESC, "id"));

    private static final char[] REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int REFERENCE_LENGTH = 6;
    private static final String REFERENCE_PREFIX = "ENQ-";

    private static final int REFERENCE_ATTEMPTS = 5;

    private static final SecureRandom RANDOM = new SecureRandom();

    private final EnquiryRepository repository;
    private final EnquiryMapper mapper;

    public List<EnquiryResponse> list() {
        return mapper.toResponses(repository.findAll(NEWEST_FIRST));
    }

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
