package org.iproduct.ksdemo.model;

import java.net.InetAddress;

public record ClientData(String id, InetAddress ip, int port) {
}
