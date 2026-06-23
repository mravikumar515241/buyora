package com.buyora.backend.admin.controller;

import com.buyora.backend.admin.dto.UpdateUserRolesRequest;
import com.buyora.backend.admin.dto.UserListResponse;
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
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserListResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserListResponse> users = adminUserService.getAllUsers(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserListResponse>> getUserById(@PathVariable Long id) {
        UserListResponse user = adminUserService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserListResponse>> updateUserRoles(
            @PathVariable Long id,
            @RequestBody UpdateUserRolesRequest request) {
        
        UserListResponse user = adminUserService.updateUserRoles(id, request.getRoles());
        return ResponseEntity.ok(ApiResponse.success("User roles updated successfully", user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<UserListResponse>> toggleUserActiveStatus(@PathVariable Long id) {
        UserListResponse user = adminUserService.toggleUserActiveStatus(id);
        String status = user.isActive() ? "activated" : "deactivated";
        return ResponseEntity.ok(ApiResponse.success("User " + status + " successfully", user));
    }
}
