package com.buyora.backend.user.service;

import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.user.dto.AuthResponse;
import com.buyora.backend.user.dto.LoginRequest;
import com.buyora.backend.user.dto.RegisterRequest;
import com.buyora.backend.user.dto.UserResponse;
import com.buyora.backend.user.dto.VendorRegisterRequest;
import com.buyora.backend.user.entity.Role;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.RoleRepository;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.notification.service.NotificationDispatcher;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final com.buyora.backend.security.JwtService jwtService;
    private final VendorRepository vendorRepository;
    private final NotificationDispatcher notificationDispatcher;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new IllegalStateException("CUSTOMER role not found"));
        User user = new User();
        user.setFullName(request.getName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(customerRole));
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    @Transactional
    public AuthResponse registerVendor(VendorRegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Get VENDOR role
        Role vendorRole = roleRepository.findByName("VENDOR")
                .orElseThrow(() -> new IllegalStateException("VENDOR role not found"));

        // Create user with VENDOR role
        User user = new User();
        user.setFullName(request.getName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(vendorRole));
        user = userRepository.save(user);

        // Create vendor profile
        Vendor vendor = new Vendor();
        vendor.setUser(user);
        vendor.setBusinessName(request.getBusinessName());
        vendor.setPhone(request.getPhone());
        vendor.setAddress(request.getAddress());
        vendor.setGstNumber(request.getGstNumber());
        vendor.setApproved(true); // Auto-approve vendors
        vendorRepository.save(vendor);

        // Generate token and return auth response
        UserPrincipal principal = UserPrincipal.from(user);
        String token = jwtService.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .type(AuthResponse.BEARER)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(Set.of("VENDOR"))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword()));
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(principal.getUserId()).orElseThrow();
        String token = jwtService.generateToken(principal);
        notificationDispatcher.newLogin(principal.getUserId());
        return AuthResponse.builder()
                .token(token)
                .type(AuthResponse.BEARER)
                .userId(principal.getUserId())
                .email(principal.getUsername())
                .fullName(user.getFullName())
                .roles(principal.getRoleNames())
                .build();
    }

    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.buyora.backend.common.exception.ResourceNotFoundException("User", "id", userId));
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        Set<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roleNames)
                .build();
    }
}
