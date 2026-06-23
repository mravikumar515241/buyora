package com.buyora.backend.admin.repository;

import com.buyora.backend.admin.entity.AdminSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSettingsRepository extends JpaRepository<AdminSettings, String> {
}
