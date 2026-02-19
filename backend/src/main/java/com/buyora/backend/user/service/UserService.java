package com.buyora.backend.user.service;

import com.buyora.backend.user.dto.RegisterRequest;
import com.buyora.backend.user.entity.Role;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegisterRequest request) {

        User user = new User();
        user.setFullName(request.getName());   // FIXED
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Temporary role creation (we will improve later)
        Role role = new Role();
        role.setName("USER");

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        user.setRoles(roles);

        return userRepository.save(user);
    }
}
