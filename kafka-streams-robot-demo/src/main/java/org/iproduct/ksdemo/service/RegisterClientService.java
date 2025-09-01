package org.iproduct.ksdemo.service;

import org.iproduct.ksdemo.model.ClientData;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Sinks;

import java.net.InetAddress;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RegisterClientService {
    private Map<String, ClientData> clients =  new ConcurrentHashMap<>();
    public void setDeviceIp(String clientId, InetAddress clientIp, int clientPort) {
        clients.put(clientId, new ClientData(clientId, clientIp, clientPort));
    }
    public ClientData getClientData(String clientId) {
        return clients.get(clientId);
    }


}
