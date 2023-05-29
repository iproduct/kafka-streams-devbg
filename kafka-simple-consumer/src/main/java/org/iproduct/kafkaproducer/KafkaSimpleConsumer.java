package org.iproduct.kafkaproducer;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.config.TopicBuilder;

@SpringBootApplication
public class KafkaSimpleConsumer {

    public static void main(String[] args) {
        SpringApplication.run(KafkaSimpleConsumer.class, args);
    }

//    @Bean
//    public NewTopic topic() {
//        return TopicBuilder.name("topic1")
//                .partitions(10)
//                .replicas(1)
//                .build();
//    }

//    @KafkaListener(id = "myId", topics = "streamingTopic2")
    @KafkaListener(id = "myId", topics = "minSweepDistance")
    public void listen(String in) {
        System.out.println(in);
    }
}
