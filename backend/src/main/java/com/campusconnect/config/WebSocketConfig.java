package com.campusconnect.config;

import com.campusconnect.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * STOMP/WebSocket configuration for the CampusConnect chat module.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final com.campusconnect.security.ChatSubscriptionInterceptor chatSubscriptionInterceptor;

    public WebSocketConfig(JwtService jwtService,
                           UserDetailsService userDetailsService,
                           com.campusconnect.security.ChatSubscriptionInterceptor chatSubscriptionInterceptor) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.chatSubscriptionInterceptor = chatSubscriptionInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Client subscribes to /topic/... and /queue/...
        registry.enableSimpleBroker("/topic", "/queue");
        // Client sends to /app/...
        registry.setApplicationDestinationPrefixes("/app");
        // Per-user queues: /user/{username}/queue/...
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = allowedOrigins.toArray(String[]::new);

        // Native WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins);

        // SockJS fallback endpoint
        registry.addEndpoint("/ws/sockjs")
                .setAllowedOriginPatterns(origins)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String email = jwtService.extractUsername(token);
                            if (email != null) {
                                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                                if (jwtService.isTokenValid(token, userDetails)) {
                                    UsernamePasswordAuthenticationToken auth =
                                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                    accessor.setUser(auth);
                                }
                            }
                        } catch (Exception ignored) {
                            // Unauthenticated: user remains null and handlers will reject
                        }
                    }
                }
                return message;
            }
        }, chatSubscriptionInterceptor);
    }
}
