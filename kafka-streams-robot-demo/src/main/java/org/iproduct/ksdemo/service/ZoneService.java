package org.iproduct.ksdemo.service;

import org.iproduct.ksdemo.model.Zone;
import org.iproduct.ksdemo.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ZoneService {

    private final ZoneRepository zoneRepository;

    public ZoneService(ZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }

    public Mono<Zone> findById(String id) {
        return zoneRepository.findById(id);
    }

    public Flux<Zone> findAll() {
        return zoneRepository.findAll();
    }

    public Mono<Zone> findByName(String name) {
        return zoneRepository.findByName(name);
    }

    public Mono<Zone> create(Zone zone) {
        return zoneRepository.save(zone);
    }

    public Mono<Zone> update(String id, Zone zone) {
        return zoneRepository.findById(id)
                .flatMap(existingZone -> {
                    existingZone.setName(zone.getName());
                    existingZone.setWateringRequirementLiters(zone.getWateringRequirementLiters());
                    existingZone.setWateringIntervalHours(zone.getWateringIntervalHours());
                    existingZone.setValveNumber(zone.getValveNumber());
                    return zoneRepository.save(existingZone);
                });
    }

    public Mono<Void> deleteById(String id) {
        return zoneRepository.deleteById(id);
    }

    public Mono<Long> count() {
        return zoneRepository.count();
    }
}
