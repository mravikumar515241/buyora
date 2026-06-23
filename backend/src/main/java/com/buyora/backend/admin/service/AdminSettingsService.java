package com.buyora.backend.admin.service;

import com.buyora.backend.admin.dto.SettingResponse;
import com.buyora.backend.admin.entity.AdminSettings;
import com.buyora.backend.admin.repository.AdminSettingsRepository;
import com.buyora.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    private final AdminSettingsRepository adminSettingsRepository;

    public List<SettingResponse> getAllSettings() {
        return adminSettingsRepository.findAll().stream()
                .map(this::mapToSettingResponse)
                .collect(Collectors.toList());
    }

    public SettingResponse getSetting(String key) {
        AdminSettings setting = adminSettingsRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found: " + key));
        return mapToSettingResponse(setting);
    }

    @Transactional
    public SettingResponse updateSetting(String key, String value) {
        AdminSettings setting = adminSettingsRepository.findById(key)
                .orElseGet(() -> {
                    AdminSettings newSetting = new AdminSettings();
                    newSetting.setSettingKey(key);
                    return newSetting;
                });

        setting.setSettingValue(value);
        
        // Add description for known settings
        if (AdminSettings.ALLOW_USER_DELETION_WITH_DATA_LOSS.equals(key)) {
            setting.setDescription("Allow admin to permanently delete users and all their associated data (orders, reviews, etc.)");
        }

        AdminSettings saved = adminSettingsRepository.save(setting);
        return mapToSettingResponse(saved);
    }

    public boolean isUserDeletionWithDataLossAllowed() {
        return adminSettingsRepository.findById(AdminSettings.ALLOW_USER_DELETION_WITH_DATA_LOSS)
                .map(setting -> "true".equalsIgnoreCase(setting.getSettingValue()))
                .orElse(false);
    }

    private SettingResponse mapToSettingResponse(AdminSettings setting) {
        return SettingResponse.builder()
                .key(setting.getSettingKey())
                .value(setting.getSettingValue())
                .description(setting.getDescription())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
