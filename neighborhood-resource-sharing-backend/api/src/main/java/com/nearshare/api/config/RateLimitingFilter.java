package com.nearshare.api.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter implements Filter {

    private final ConcurrentHashMap<String, RateLimitInfo> ipRequestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 120; // 120 requests per minute limit

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            String ip = httpRequest.getRemoteAddr();
            long now = System.currentTimeMillis();

            RateLimitInfo info = ipRequestCounts.compute(ip, (k, v) -> {
                if (v == null || (now - v.windowStart) > 60000) {
                    return new RateLimitInfo(now, new AtomicInteger(1));
                } else {
                    v.count.incrementAndGet();
                    return v;
                }
            });

            if (info.count.get() > MAX_REQUESTS_PER_MINUTE) {
                httpResponse.setStatus(429); // 429 Too Many Requests
                httpResponse.setContentType("text/plain");
                httpResponse.getWriter().write("Too many requests. Please try again later.");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private static class RateLimitInfo {
        long windowStart;
        AtomicInteger count;

        RateLimitInfo(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
