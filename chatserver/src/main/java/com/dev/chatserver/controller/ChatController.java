package com.dev.chatserver.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.dev.chatserver.model.Mensagem;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    
    @MessageMapping("/message") // /app/message
    @SendTo("/chatroom/public")
    public Mensagem receiverPublicMessage(@Payload Mensagem message){
        System.out.println("Mensagem pública: "+message.getMessage());
        return message;
    }

    @MessageMapping("/private-message")
    public Mensagem receiverPrivateMessage(@Payload Mensagem message){
        System.out.println("Mensagem PRIVADA: "+message.getMessage());
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),"/private",message); // /user/Frank/private
        return message;
    } 


}
