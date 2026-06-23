package com.buyora.backend.user.service;

import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is deactivated: " + username);
        }
        
        return UserPrincipal.from(user);
    }
}
