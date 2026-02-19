package com.buyora.backend.user.controller;

import com.buyora.backend.user.dto.RegisterRequest;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }
}
