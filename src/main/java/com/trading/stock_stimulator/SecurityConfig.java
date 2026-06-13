package com.trading.stock_stimulator;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for WebSocket
                .csrf(csrf -> csrf.disable())

                // Allow all requests for demo
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/**").permitAll()
                )

                // Disable default login page
                .formLogin(form -> form.disable())

                // Disable basic auth popup
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}