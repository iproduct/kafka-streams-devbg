package org.iproduct.ksdemo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.eclipse.californium.core.coap.Request;
import org.eclipse.californium.core.coap.Response;
import org.eclipse.californium.core.config.CoapConfig;
import org.eclipse.californium.core.network.CoapEndpoint;
import org.iproduct.ksdemo.model.ClientData;
import org.iproduct.ksdemo.model.Command;
import org.iproduct.ksdemo.model.CommandAcknowledgement;
import org.iproduct.ksdemo.model.IrrigationControllerState;
import org.iproduct.ksdemo.service.ReactiveRobotService;
import org.iproduct.ksdemo.service.RegisterClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.core.KafkaTemplate;
import org.eclipse.californium.core.CoapResource;
import org.eclipse.californium.core.CoapServer;
import org.eclipse.californium.core.server.resources.CoapExchange;

import static org.eclipse.californium.core.coap.CoAP.ResponseCode.*;
import static reactor.core.publisher.Sinks.EmitFailureHandler.FAIL_FAST;

import java.net.InetSocketAddress;

@SpringBootApplication
@Slf4j
public class KafkaStreamsRobotDemoApplication {
    public static final String SERVER_IP = "192.168.0.17";
    public static final int COAP_PORT = 5683;

    @Autowired
    private KafkaTemplate<Integer, String> template;

    @Autowired
    private ReactiveRobotService robotService;

    @Autowired
    private RegisterClientService clientService;

    @Autowired
    ObjectMapper mapper;


    static {
        CoapConfig.register();
    }

    public static void main(String[] args) {
        SpringApplication.run(KafkaStreamsRobotDemoApplication.class, args);
    }

    @Bean
    public ApplicationRunner runner() {
        return args -> {
            // binds on UDP port 5683
            CoapServer server = new CoapServer();
            server.addEndpoint(CoapEndpoint.builder().setInetSocketAddress(new InetSocketAddress(SERVER_IP, COAP_PORT)).build());

            server.add(new HelloResource());
            server.add(new TimeResource());
            server.add(new RegisterClientResource());
            server.add(new SensorsResource());

            server.start();
            robotService.getCommands().asFlux().subscribe(commandStr -> {
                try {
                    Command command = mapper.readValue(commandStr, Command.class);
                    Request request = Request.newPut();
                    ClientData client = clientService.getClientData(command.getDeviceId());
                    request.setURI("coap:/" + client.ip() + ":" + client.port() + "/commands");
                    request.setPayload(commandStr);
                    request.send();
                    log.info("!!! Sent command: {}", request);
                    Response response = request.waitForResponse(1000);
                    log.info("!!! Received: " + response);
                    val commandAck = new CommandAcknowledgement("command_ack", command.getDeviceId(), response.getPayloadString());
                    robotService.getSensorReadings().emitNext(mapper.writeValueAsString(commandAck), FAIL_FAST);
                } catch (Exception e) {
                    log.error("Error sending command to robot: {}", e);
                    robotService.getSensorReadings().emitNext(String.format("{\"error\":\"%s\"}", e.getMessage()), FAIL_FAST);
                }
            });
        };
    }

    public static class HelloResource extends CoapResource {
        public HelloResource() {
            // resource identifier
            super("hello");
            // set display name
            getAttributes().setTitle("Hello-World Resource");
        }

        @Override
        public void handleGET(CoapExchange exchange) {
            exchange.respond("Hello world!");
        }
    }

    public static class TimeResource extends CoapResource {
        public TimeResource() {
            super("time");
        }

        @Override
        public void handleGET(CoapExchange exchange) {
            log.info("Received request from {}:{}", exchange.getSourceAddress(), exchange.getSourcePort());
            exchange.respond("{\"type\":\"time\", \"time\":\"" + String.valueOf(System.currentTimeMillis()) + "\"}");
        }
    }

    public class RegisterClientResource extends CoapResource {

        public RegisterClientResource() {
            // resource identifier
            super("register");
            // set display name
            getAttributes().setTitle("Register Client Resource");
        }

        @Override
        public void handleGET(CoapExchange exchange) {
            String clientId = exchange.getRequestText();
            try {
                exchange.respond(mapper.writeValueAsString(clientService.getClientData(clientId)));
            } catch (JsonProcessingException e) {
                log.error("Error getting client data: ", e);
                exchange.respond(BAD_REQUEST, "Error getting client data");
            }
        }

        @Override
        public void handlePUT(CoapExchange exchange) {
            byte[] payload = exchange.getRequestPayload();
            log.info("Register Client: Received request: {} - {}:{}", new String(payload), exchange.getSourceAddress(), exchange.getSourcePort());

            try {
                String clientId = new String(payload, "UTF-8");
                log.info("Registering client IP: {} - {}:{}", clientId, exchange.getSourceAddress(), exchange.getSourcePort());
                clientService.setDeviceIp(clientId, exchange.getSourceAddress(), exchange.getSourcePort());
                exchange.respond(CHANGED, clientId);
            } catch (Exception e) {
                e.printStackTrace();
                exchange.respond(BAD_REQUEST, "Invalid String");
            }
        }
    }

    public class SensorsResource extends CoapResource {
        private String value = "";

        public SensorsResource() {
            // resource identifier
            super("sensors");
            // set display name
            getAttributes().setTitle("Sensors Resource");
        }

        @Override
        public void handleGET(CoapExchange exchange) {
            exchange.respond(value);
        }

        @Override
        public void handlePUT(CoapExchange exchange) {
            byte[] payload = exchange.getRequestPayload();

            try {
                value = new String(payload, "UTF-8");
                IrrigationControllerState state = mapper.readValue(value, IrrigationControllerState.class);
                log.info("Received state: {} - {}:{}", state, exchange.getSourceAddress(), exchange.getSourcePort());
                clientService.setDeviceIp(state.deviceId(), exchange.getSourceAddress(), exchange.getSourcePort());
                value = mapper.writeValueAsString(state);
                robotService.getSensorReadings().emitNext(value, FAIL_FAST);
                template.send("sweepDistances", 1, value);
                exchange.respond(CHANGED, value);
            } catch (Exception e) {
                e.printStackTrace();
                exchange.respond(BAD_REQUEST, "Invalid String");
            }
        }
    }
}
