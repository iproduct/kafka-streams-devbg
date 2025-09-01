package org.iproduct.ksdemo.repository;

import org.iproduct.ksdemo.model.Zone;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface ZoneRepository extends ReactiveMongoRepository<Zone, String> {
    Mono<Zone> findByName(String name);
}
