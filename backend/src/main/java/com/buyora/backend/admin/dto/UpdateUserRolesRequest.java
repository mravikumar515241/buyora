package com.buyora.backend.admin.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRolesRequest {
    private Set<String> roles;
}
