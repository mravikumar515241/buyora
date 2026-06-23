package com.buyora.backend.admin.controller;

import com.buyora.backend.admin.dto.VendorDetailsResponse;
import com.buyora.backend.admin.service.AdminUserService;
import com.buyora.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vendors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminVendorController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VendorDetailsResponse>>> getAllVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<VendorDetailsResponse> vendors = adminUserService.getAllVendors(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", vendors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VendorDetailsResponse>> getVendorById(@PathVariable Long id) {
        VendorDetailsResponse vendor = adminUserService.getVendorById(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor retrieved successfully", vendor));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<VendorDetailsResponse>> approveVendor(@PathVariable Long id) {
        VendorDetailsResponse vendor = adminUserService.approveVendor(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor approved successfully", vendor));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<VendorDetailsResponse>> rejectVendor(@PathVariable Long id) {
        VendorDetailsResponse vendor = adminUserService.rejectVendor(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor rejected successfully", vendor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteVendor(@PathVariable Long id) {
        adminUserService.deleteVendor(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor deleted successfully", null));
    }
}
