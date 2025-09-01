package org.iproduct.ksdemo.web.router;

import org.iproduct.ksdemo.web.handler.ZoneHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.RequestPredicates.*;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@Configuration
public class ZoneRouter {

    @Bean
    public RouterFunction<ServerResponse> zoneRoutes(ZoneHandler zoneHandler) {
        return route(GET("/api/zones").and(accept(APPLICATION_JSON)), zoneHandler::getAllZones)
                .andRoute(GET("/api/zones/count").and(accept(APPLICATION_JSON)), zoneHandler::getZoneCount)
                .andRoute(GET("/api/zones/{id}").and(accept(APPLICATION_JSON)), zoneHandler::getZoneById)
                .andRoute(GET("/api/zones/name/{name}").and(accept(APPLICATION_JSON)), zoneHandler::getZoneByName)
                .andRoute(POST("/api/zones").and(accept(APPLICATION_JSON)), zoneHandler::createZone)
                .andRoute(PUT("/api/zones/{id}").and(accept(APPLICATION_JSON)), zoneHandler::updateZone)
                .andRoute(DELETE("/api/zones/{id}").and(accept(APPLICATION_JSON)), zoneHandler::deleteZone);
    }
}
