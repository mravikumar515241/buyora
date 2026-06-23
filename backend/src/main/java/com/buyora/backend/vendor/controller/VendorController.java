package com.buyora.backend.vendor.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.vendor.dto.VendorProfileResponse;
import com.buyora.backend.vendor.dto.VendorRequest;
import com.buyora.backend.vendor.dto.VendorResponse;
import com.buyora.backend.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VendorProfileResponse>> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vendorService.getProfileById(id)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<VendorResponse>> register(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VendorRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        VendorResponse vendor = vendorService.registerVendor(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Vendor registration submitted", vendor));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<VendorResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        VendorResponse vendor = vendorService.getByUserId(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(vendor));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<VendorResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VendorRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        VendorResponse vendor = vendorService.update(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", vendor));
    }
}
