package org.iproduct.ksdemo.model;

import lombok.Data;

@Data
public class Command {
    private String deviceId;
    private String command;
    private int[] params;
}
