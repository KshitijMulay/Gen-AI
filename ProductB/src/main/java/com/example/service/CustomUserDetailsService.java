package com.example.service;

import com.example.model.User;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    	User user = userRepository.findByUsername(username)
    	        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    	org.springframework.security.core.userdetails.User.UserBuilder builder =
    	        org.springframework.security.core.userdetails.User.withUsername(user.getUsername());
    	builder.password(user.getPassword());
    	builder.roles("USER");
    	return builder.build();
    }
}
