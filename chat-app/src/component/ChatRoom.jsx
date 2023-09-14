import React, { useEffect, useState } from "react";
import { over } from "stompjs";
import { Fieldset } from 'primereact/fieldset';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import SockJS from "sockjs-client";
import EmojiPicker from 'emoji-picker-react';


var stompClient = null;
const ChatRoom = () => {
  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);


  const [tab, setTab] = useState("CHATROOM");
  const [userData, setUserData] = useState({
    username: "",
    receivername: "",
    connected: false,
    message: "",
  });
  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const connect = () => {
    let sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setUserData({ ...userData, connected: true });
    stompClient.subscribe("/chatroom/public", onMessageReceived);
    stompClient.subscribe(
      "/user/" + userData.username + "/private",
      onPrivateMessage
    );
    userJoin();
  };

  const userJoin = () => {
    var chatMessage = {
      senderName: userData.username,
      status: "JOIN",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    console.log("RECEBENDO MENSAGEM");
    var payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "JOIN":
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case "MESSAGE":
        publicChats.push(payloadData);
        setPublicChats([...publicChats]);
        break;
    }
  };

  const onPrivateMessage = (payload) => {
    console.log(payload);
    var payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.senderName, list);
      setPrivateChats(new Map(privateChats));
    }
  };

  const onError = (err) => {
    console.log(err);
  };

  const [isMessageValid, setIsMessageValid] = useState(true);

  const handleMessage = (event) => {
    const { value } = event.target;
    setIsMessageValid(!!value);
    setUserData({ ...userData, message: value });
  };
  const sendValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: "MESSAGE",
      };
      console.log(chatMessage);
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const sendPrivateValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        receiverName: tab,
        message: userData.message,
        status: "MESSAGE",
      };


      if (userData.username !== tab) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const verificaVazioPrivado = () => {
    if (!userData.message || userData.message.trim() === "") {
      console.log("ESTA VAZIO");
    } else { 
      sendPrivateValue();
    }
  };

  const verificaVazioGeral = () => {

    if (userData.message == "" || userData.message == null) {
    } else {
      sendValue();
    }
  }

  const handleUsername = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, username: value });
  };

  const registerUser = () => {
    connect();
  };
  return (
    <div className="container">
      {userData.connected ? (
        <div className="chat-box">
          <Fieldset className="member-list" legend={'Lista de Chats'}>
            <div className="a">
              <ul>
                <li
                  onClick={() => {
                    setTab("CHATROOM");
                  }}
                  className={`member ${tab === "CHATROOM" && "active"}`}
                >
                  Chatroom
                </li>
                {[...privateChats.keys()].map((name, index) => (
                  <li
                    onClick={() => {
                      setTab(name);
                    }}
                    className={`member ${tab === name && "active"}`}
                    key={index}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </Fieldset>

          {tab === "CHATROOM" && (
            <div className="chat-content">
              <ul>
                <Fieldset className="chat-message" legend="Chatroom">
                  <div className="scrollable-content">
                    <ul className="chat-messages">
                      {publicChats.map((chat, index) => (
                        <li
                          className={`message ${chat.senderName === userData.username ? "user-message" : ""}`}
                          key={index}
                        >
                          {chat.senderName !== userData.username && (
                            <div className={`avatar ${chat.senderName === userData.username ? "user-avatar" : ""}`}>
                              {chat.senderName}
                            </div>
                          )}
                          <div className={`message-data ${chat.senderName === userData.username ? "user-data" : ""}`}>
                            {chat.message}
                          </div>
                          {chat.senderName === userData.username && (
                            <div className={`avatar ${chat.senderName === userData.username ? "user-avatar" : ""}`}>
                              {chat.senderName}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Fieldset>
              </ul>



              <div className="">
                <InputText type="text"
                  className={`input-message ${!isMessageValid ? "p-invalid" : ""}`}
                  placeholder="Insira a mensagem"
                  value={userData.message}
                  onChange={handleMessage} 
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); 
                      if (!isMessageValid) {
                        setIsMessageValid(false);
                      } else {
                        verificaVazioGeral();
                      }
                    }
                  }}
                />
                <Button
                  label="Enviar"
                  type="button"
                  className="send-button"
                  onClick={() => {
                    if (!userData.message || userData.message.trim() === "") {
                      setIsMessageValid(false);
                    } else {
                      setIsMessageValid(true);
                      verificaVazioGeral();
                    }
                  }}
                />
              </div>
            </div>
          )}
          {tab !== "CHATROOM" && (
            <div className="chat-content">
              <ul >
                <Fieldset className="chat-message" legend={userData.username}>
                  <div className="scrollable-content">
                    <ul className="chat-messages">
                      {[...privateChats.get(tab)].map((chat, index) => (
                        <li className={`message`} key={index}>
                          <div className={`avatar ${chat.senderName === userData.username ? "user-avatar" : ""}`}>
                            {chat.senderName}
                          </div>
                          <div className="message-data">{chat.message}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Fieldset>

              </ul>

              <div className="">
                <InputText type="text"
                  className={`input-message ${!isMessageValid ? "p-invalid" : ""}`}
                  placeholder="Insira a mensagem"
                  value={userData.message}
                  onChange={handleMessage} 
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); 
                      if (!isMessageValid) {
                        setIsMessageValid(false);
                      } else {
                        verificaVazioGeral();
                      }
                    }
                  }}
                />
                <Button
                  label="Enviar"
                  type="button"
                  className="send-button"
                  onClick={() => {
                    if (!userData.message || userData.message.trim() === "") {
                      setIsMessageValid(false);
                    } else {
                      setIsMessageValid(true);
                      verificaVazioPrivado();
                    }
                  }}
                />
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="register">
          <Fieldset legend="Insira seu nome">
            <InputText
              id="user-name"
              className={` ${!isMessageValid ? "p-invalid" : ""}`}
              placeholder="Insira seu nome"
              name="userName"
              value={userData.username}
              onChange={handleUsername}
            />
            
            <Button
              className="Button"
              label="Entrar"
              type="button"
              onClick={() => {
                if (!userData.username || userData.username.trim() === "") {
                  setIsMessageValid(false);
                } else {
                  setIsMessageValid(true);
                  verificaVazioPrivado();
                  registerUser();
                }
              }}
            />
          </Fieldset>

        </div>
      )}
    </div>
  );
};

export default ChatRoom;
