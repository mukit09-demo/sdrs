package com.banyan.lab.sdrs.mapper;

import com.banyan.lab.sdrs.dto.EnquiryReceiptResponse;
import com.banyan.lab.sdrs.dto.EnquiryRequest;
import com.banyan.lab.sdrs.dto.EnquiryResponse;
import com.banyan.lab.sdrs.entity.Enquiry;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface EnquiryMapper {

    EnquiryResponse toResponse(Enquiry entity);

    List<EnquiryResponse> toResponses(List<Enquiry> entities);

    EnquiryReceiptResponse toReceipt(Enquiry entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "receivedAt", ignore = true)
    Enquiry toEntity(EnquiryRequest request);
}
