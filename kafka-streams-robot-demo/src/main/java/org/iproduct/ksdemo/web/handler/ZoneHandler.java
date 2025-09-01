package org.iproduct.ksdemo.web.handler;

import org.iproduct.ksdemo.model.Zone;
import org.iproduct.ksdemo.service.ZoneService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

@Component
public class ZoneHandler {

    private final ZoneService zoneService;

    public ZoneHandler(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    public Mono<ServerResponse> getZoneById(ServerRequest request) {
        String id = request.pathVariable("id");
        return zoneService.findById(id)
                .flatMap(zone -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(zone))
                .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> getZoneByName(ServerRequest request) {
        String name = request.pathVariable("name");
        return zoneService.findByName(name)
                .flatMap(zone -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(zone))
                .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> getAllZones(ServerRequest request) {
        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(zoneService.findAll(), Zone.class);
    }

    public Mono<ServerResponse> createZone(ServerRequest request) {
        return request.bodyToMono(Zone.class)
                .flatMap(zoneService::create)
                .flatMap(zone -> ServerResponse.status(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON).bodyValue(zone));
    }

    public Mono<ServerResponse> updateZone(ServerRequest request) {
        String id = request.pathVariable("id");
        return request.bodyToMono(Zone.class)
                .flatMap(zone -> zoneService.update(id, zone))
                .flatMap(zone -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(zone))
                .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> deleteZone(ServerRequest request) {
        String id = request.pathVariable("id");
        return zoneService.deleteById(id)
                .then(ServerResponse.noContent().build());
    }

    public Mono<ServerResponse> getZoneCount(ServerRequest request) {
        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(zoneService.count(), Long.class);
    }
}
