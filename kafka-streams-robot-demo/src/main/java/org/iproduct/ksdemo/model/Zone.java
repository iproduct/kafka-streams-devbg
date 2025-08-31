package org.iproduct.ksdemo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "zones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Zone {
    @Id
    private String id;
    private String name;
    private double wateringRequirementLiters;
    private long wateringIntervalHours;
    private int valveNumber;
}
