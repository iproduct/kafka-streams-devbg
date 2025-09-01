package org.iproduct.ksdemo.web.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.util.HashMap;

@Slf4j
@Component
public class IndexPageHandler {
    public Mono<ServerResponse> getIndexPage(ServerRequest request) {
        try {
            return ServerResponse.ok().render("index");
//            , Map.of(
//                    "rates", pagedRates,
//                    "currentPage", page,
//                    "totalPages", totalPages
//            ));
        } catch (Exception e) {
            log.error("Error rendering index.html", e);
            return ServerResponse.status(500).bodyValue("Error processing rates data");
        }
    }
}
