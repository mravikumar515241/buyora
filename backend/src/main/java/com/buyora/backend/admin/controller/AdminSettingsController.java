package com.buyora.backend.admin.controller;

import com.buyora.backend.admin.dto.SettingResponse;
import com.buyora.backend.admin.dto.UpdateSettingRequest;
import com.buyora.backend.admin.service.AdminSettingsService;
import com.buyora.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    @GetMapping
    public ApiResponse<List<SettingResponse>> getAllSettings() {
        List<SettingResponse> settings = adminSettingsService.getAllSettings();
        return ApiResponse.success("Settings retrieved successfully", settings);
    }

    @GetMapping("/{key}")
    public ApiResponse<SettingResponse> getSetting(@PathVariable String key) {
        SettingResponse setting = adminSettingsService.getSetting(key);
        return ApiResponse.success("Setting retrieved successfully", setting);
    }

    @PutMapping("/{key}")
    public ApiResponse<SettingResponse> updateSetting(
            @PathVariable String key,
            @RequestBody UpdateSettingRequest request) {
        SettingResponse setting = adminSettingsService.updateSetting(key, request.getValue());
        return ApiResponse.success("Setting updated successfully", setting);
    }
}
