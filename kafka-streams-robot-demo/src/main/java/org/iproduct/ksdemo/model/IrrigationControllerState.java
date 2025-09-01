package org.iproduct.ksdemo.model;

public record IrrigationControllerState(
        String type,
        long time,
        String deviceId,
        int[] valves,
        int flow1,
        int flow2,
        int flow3,
        int moist01,
        int moist02
) {
}
