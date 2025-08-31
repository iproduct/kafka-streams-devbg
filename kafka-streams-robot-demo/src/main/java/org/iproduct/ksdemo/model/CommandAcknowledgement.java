package org.iproduct.ksdemo.model;

import lombok.Data;

public record CommandAcknowledgement(String type, String deviceId, String command) {
}
