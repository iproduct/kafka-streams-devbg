package org.iproduct.ksdemo.model;

public record IrrigationControllerState(
        String type,
        long time,
        long start_time,
        String deviceId,
        int[] valves,
        int[] flows,
        int[] moists
) {
}
