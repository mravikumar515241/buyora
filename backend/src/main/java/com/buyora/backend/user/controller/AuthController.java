package com.buyora.backend.user.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.user.dto.AuthResponse;
import com.buyora.backend.user.dto.LoginRequest;
import com.buyora.backend.user.dto.RegisterRequest;
import com.buyora.backend.user.dto.UserResponse;
import com.buyora.backend.user.dto.VendorRegisterRequest;
import com.buyora.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", user));
    }

    @PostMapping("/register/vendor")
    public ResponseEntity<ApiResponse<AuthResponse>> registerVendor(@Valid @RequestBody VendorRegisterRequest request) {
        AuthResponse auth = userService.registerVendor(request);
        return ResponseEntity.ok(ApiResponse.success("Vendor registration successful", auth));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", auth));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        UserResponse user = userService.getCurrentUser(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
