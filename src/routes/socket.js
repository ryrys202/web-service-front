import { io } from "socket.io-client";

const socket = io('https://themeeter.ru', { transports: ['websocket'] });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;