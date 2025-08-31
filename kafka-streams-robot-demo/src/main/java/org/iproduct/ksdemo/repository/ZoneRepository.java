package org.iproduct.ksdemo.repository;

import org.iproduct.ksdemo.model.Zone;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface ZoneRepository extends ReactiveMongoRepository<Zone, String> {
}
