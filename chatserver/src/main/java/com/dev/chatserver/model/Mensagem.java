package com.dev.chatserver.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Mensagem {
    
    private String senderName;
    private String receiverName;
    private String message;
    private String data;
    private Status status;
}
