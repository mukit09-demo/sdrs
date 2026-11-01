package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.banyan.lab.sdrs.dto.EnquiryReceiptResponse;
import com.banyan.lab.sdrs.dto.EnquiryRequest;
import com.banyan.lab.sdrs.dto.EnquiryResponse;
import com.banyan.lab.sdrs.entity.Enquiry;
import com.banyan.lab.sdrs.mapper.EnquiryMapper;
import com.banyan.lab.sdrs.repository.EnquiryRepository;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

/** The inbox order, and the reference minted for each submission. */
@ExtendWith(MockitoExtension.class)
class EnquiryServiceTest {

    /** {@code ENQ-} then six characters, none of them {@code I}, {@code O}, {@code 0} or {@code 1}. */
    private static final String REFERENCE = "ENQ-[A-HJ-NP-Z2-9]{6}";

    private static final Instant RECEIVED = Instant.parse("2026-10-10T14:32:05Z");

    @Mock
    private EnquiryRepository repository;

    private EnquiryService service;

    @BeforeEach
    void setUp() {
        service = new EnquiryService(repository, Mappers.getMapper(EnquiryMapper.class));
    }

    private static EnquiryRequest request() {
        return new EnquiryRequest(
                "Ada Lovelace", "ada@example.com", null, "Rail", "Do you work on light rail?");
    }

    private static Enquiry enquiry(String reference) {
        Enquiry enquiry = new Enquiry();
        enquiry.setReference(reference);
        enquiry.setName("Ada Lovelace");
        enquiry.setEmail("ada@example.com");
        enquiry.setTopic("Rail");
        enquiry.setMessage("Do you work on light rail?");
        enquiry.setReceivedAt(RECEIVED);
        return enquiry;
    }

    /** What Hibernate would do on save: stamp the instant. */
    private void saveStampsReceivedAt() {
        when(repository.save(any())).thenAnswer(invocation -> {
            Enquiry saved = invocation.getArgument(0);
            saved.setReceivedAt(RECEIVED);
            return saved;
        });
    }

    @Test
    @DisplayName("the inbox is newest first, with id as a tiebreaker")
    void testIfListReturnsInboxNewestFirst() {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(enquiry("ENQ-AAAAAA")));

        List<EnquiryResponse> inbox = service.list();

        assertThat(inbox).singleElement().satisfies(row -> {
            assertThat(row.reference()).isEqualTo("ENQ-AAAAAA");
            assertThat(row.email()).isEqualTo("ada@example.com");
            assertThat(row.receivedAt()).isEqualTo(RECEIVED);
        });

        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(repository).findAll(sort.capture());
        assertThat(sort.getValue()).isEqualTo(
                Sort.by(Sort.Direction.DESC, "receivedAt").and(Sort.by(Sort.Direction.DESC, "id")));
    }

    @Test
    @DisplayName("an empty inbox is an empty list")
    void testIfListReturnsEmptyWhenInboxIsEmpty() {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of());

        assertThat(service.list()).isEmpty();
    }

    @Test
    @DisplayName("submit stores the enquiry with a freshly minted reference and returns only the receipt")
    void testIfSubmitStoresEnquiryWithNewReference() {
        when(repository.existsByReference(anyString())).thenReturn(false);
        saveStampsReceivedAt();

        EnquiryReceiptResponse receipt = service.submit(request());

        assertThat(receipt.reference()).matches(REFERENCE);
        assertThat(receipt.receivedAt()).isEqualTo(RECEIVED);

        ArgumentCaptor<Enquiry> saved = ArgumentCaptor.forClass(Enquiry.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getReference()).isEqualTo(receipt.reference());
        assertThat(saved.getValue().getId()).isNull();
        assertThat(saved.getValue().getName()).isEqualTo("Ada Lovelace");
        assertThat(saved.getValue().getOrganisation()).isNull();
    }

    @Test
    @DisplayName("a reference already taken is retried, not reused")
    void testIfSubmitRetriesWhenReferenceIsTaken() {
        when(repository.existsByReference(anyString())).thenReturn(true, true, false);
        saveStampsReceivedAt();

        EnquiryReceiptResponse receipt = service.submit(request());

        assertThat(receipt.reference()).matches(REFERENCE);
        verify(repository, times(3)).existsByReference(anyString());
    }

    @Test
    @DisplayName("the last of the five attempts can still succeed")
    void testIfSubmitSucceedsOnTheFifthAttempt() {
        when(repository.existsByReference(anyString())).thenReturn(true, true, true, true, false);
        saveStampsReceivedAt();

        assertThat(service.submit(request()).reference()).matches(REFERENCE);
        verify(repository, times(5)).existsByReference(anyString());
    }

    @Test
    @DisplayName("five collisions in a row give up rather than loop or store a duplicate")
    void testIfSubmitGivesUpAfterFiveCollisions() {
        when(repository.existsByReference(anyString())).thenReturn(true);

        assertThatThrownBy(() -> service.submit(request()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("5 attempts");
        verify(repository, times(5)).existsByReference(anyString());
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("references are random, not sequential")
    void testIfSubmittedReferencesAreRandom() {
        when(repository.existsByReference(anyString())).thenReturn(false);
        saveStampsReceivedAt();

        Set<String> minted = new HashSet<>();
        for (int i = 0; i < 20; i++) {
            minted.add(service.submit(request()).reference());
        }

        // 20 draws from 32^6 colliding is ~2e-7; anything less than 20 is a bug.
        assertThat(minted).hasSize(20).allMatch(reference -> reference.matches(REFERENCE));
    }
}
