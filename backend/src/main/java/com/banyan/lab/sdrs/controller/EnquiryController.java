package com.banyan.lab.sdrs.controller;

import com.banyan.lab.sdrs.dto.EnquiryReceiptResponse;
import com.banyan.lab.sdrs.dto.EnquiryRequest;
import com.banyan.lab.sdrs.dto.EnquiryResponse;
import com.banyan.lab.sdrs.service.EnquiryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryService service;

    @PostMapping("/api/enquiries")
    @ResponseStatus(HttpStatus.CREATED)
    public EnquiryReceiptResponse submit(@Valid @RequestBody EnquiryRequest request) {
        return service.submit(request);
    }

    @GetMapping("/api/admin/enquiries")
    public List<EnquiryResponse> list() {
        return service.list();
    }
}
