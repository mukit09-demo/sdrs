package com.banyan.lab.sdrs.mapper;

import com.banyan.lab.sdrs.dto.EnquiryReceiptResponse;
import com.banyan.lab.sdrs.dto.EnquiryRequest;
import com.banyan.lab.sdrs.dto.EnquiryResponse;
import com.banyan.lab.sdrs.entity.Enquiry;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Entity ↔ DTO for enquiries, on the same terms as {@link NewsMapper}:
 * generated at compile time with {@code unmappedTargetPolicy=ERROR}, so a field
 * added to one side and not the other fails the build.
 *
 * <p>Two response shapes from one entity. {@code toReceipt} is what the public
 * POST returns and carries only the reference and the instant;
 * {@code toResponse} is the admin inbox row and carries everything. They are
 * separate methods rather than one shape with nulls because the narrower one is
 * a disclosure boundary — see {@link EnquiryReceiptResponse}.
 */
@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface EnquiryMapper {

    EnquiryResponse toResponse(Enquiry entity);

    List<EnquiryResponse> toResponses(List<Enquiry> entities);

    EnquiryReceiptResponse toReceipt(Enquiry entity);

    // The surrogate key is the database's, the reference is the service's and
    // receivedAt is Hibernate's. A submitter may set none of the three.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "receivedAt", ignore = true)
    Enquiry toEntity(EnquiryRequest request);
}
