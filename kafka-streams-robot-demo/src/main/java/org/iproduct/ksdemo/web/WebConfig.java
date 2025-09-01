package org.iproduct.ksdemo.web;

import org.iproduct.ksdemo.web.handler.ZoneHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.iproduct.ksdemo.web.handler.IndexPageHandler;
import org.iproduct.ksdemo.web.router.ZoneRouter;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@Configuration
public class WebConfig implements WebFluxConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry corsRegistry) {
        corsRegistry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("PUT", "GET", "POST", "DELETE", "OPTIONS")
                .maxAge(3600);
    }

    @Bean
//    public RouterFunction<ServerResponse> htmlRouter(@Value("classpath:/templates/index.html") Resource html) {
    public RouterFunction<ServerResponse> indexPageRouter(IndexPageHandler indexPageHandler) {
        return route().GET("/", indexPageHandler::getIndexPage).build();
//        return route(GET("/"), request -> ok().contentType(MediaType.TEXT_HTML).syncBody(html));
    }

//    @Override
//    public WebSocketService getWebSocketService() {
//        TomcatRequestUpgradeStrategy strategy = new TomcatRequestUpgradeStrategy();
//        strategy.setMaxSessionIdleTimeout(0L);
//        return new HandshakeWebSocketService(strategy);
//    }
    @Bean
    public HandlerMapping webSocketHandlerMapping(WebSocketHandler reactiveWebSocketHandler) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws", reactiveWebSocketHandler);

        SimpleUrlHandlerMapping handlerMapping = new SimpleUrlHandlerMapping();
        handlerMapping.setOrder(1);
        handlerMapping.setUrlMap(map);
        return handlerMapping;
    }
}

