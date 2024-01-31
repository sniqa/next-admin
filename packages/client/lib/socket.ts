import { ClientToServerEvents, ServerToClientEvents } from "@next-admin/types";
import { Manager, Socket } from "socket.io-client";

const generateSocket = () => {
  "use client";
  // const hostname = window?.location?.hostname
  // const protocol = window?.location?.protocol
  const port = 3001;

  const hostname = "http://localhost";

  // const url = `${protocol}//${hostname}:${port}`
  const url = `${hostname}:${port}`;

  const manager = new Manager(url);

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    manager.socket("/");

  return socket;
};

export default generateSocket();
