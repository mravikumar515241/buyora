package com.buyora.backend.user.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.user.dto.AddressRequest;
import com.buyora.backend.user.dto.AddressResponse;
import com.buyora.backend.user.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getUserAddresses(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AddressResponse> addresses = addressService.getUserAddresses(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved", addresses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AddressResponse address = addressService.getAddressById(id, userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Address retrieved", address));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<AddressResponse>> getDefaultAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AddressResponse address = addressService.getDefaultAddress(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Default address retrieved", address));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AddressResponse address = addressService.createAddress(request, userPrincipal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address created successfully", address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AddressResponse address = addressService.updateAddress(id, request, userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        addressService.deleteAddress(id, userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    @PutMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AddressResponse address = addressService.setDefaultAddress(id, userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Default address set successfully", address));
    }
}
