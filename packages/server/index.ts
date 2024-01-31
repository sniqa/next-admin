import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@next-admin/types";
import { faildResult, successResult } from "@next-admin/utils";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {
  create_device,
  delete_device,
  delete_selected_device,
  find_device,
  find_device_history,
  update_device,
  upload_device,
} from "./controllers/device/device";
import {
  create_device_model,
  find_device_model,
} from "./controllers/device/deviceModel";
import {
  create_device_status,
  find_device_status,
} from "./controllers/device/deviceStatus";

import {
  create_network,
  delete_network,
  find_network,
  update_ip_address,
} from "./controllers/network";
import {
  create_user,
  delete_user,
  find_user,
  update_user,
} from "./controllers/user";

const httpServer = createServer();

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(httpServer, {
  cors: {
    origin: "*",
  },
});

const sendUserData = async (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    any
  >
) => {
  try {
    const users = await find_user();
    socket.emit("find_user", successResult(users as any));
  } catch (err) {
    socket.emit("find_user", faildResult((err as Error).message));
  }
};

const sendNetworkData = async (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    any
  >
) => {
  try {
    const networks = await find_network();
    socket.emit("find_network", successResult(networks as any));
  } catch (err) {
    socket.emit("find_network", faildResult((err as Error).message));
  }
};

const sendDeviceData = async (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    any
  >
) => {
  try {
    const devices = await find_device();
    socket.emit("find_device", successResult(devices as any));
  } catch (err) {
    socket.emit("find_device", faildResult((err as Error).message));
  }
};

const sendDeviceModelData = async (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    any
  >
) => {
  try {
    const deviceModels = await find_device_model();
    socket.emit("find_device_model", successResult(deviceModels as any));
  } catch (err) {
    socket.emit("find_device_model", faildResult((err as Error).message));
  }
};

const sendDeviceStatusData = async (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    any
  >
) => {
  try {
    const deviceStatus = await find_device_status();
    socket.emit("find_device_status", successResult(deviceStatus as any));
  } catch (err) {
    socket.emit("find_device_status", faildResult((err as Error).message));
  }
};

io.on("connection", (socket) => {
  socket.on("get_data", async (data) => {
    data.map((d) => {
      switch (d) {
        case "find_device":
          return sendDeviceData(socket);
        case "find_device_model":
          return sendDeviceModelData(socket);
        case "find_user":
          return sendUserData(socket);
        case "find_network":
          return sendNetworkData(socket);
        case "find_device_status":
          return sendDeviceStatusData(socket);
      }
    });
  });

  // network
  socket.on("create_network", async (data, callback) => {
    try {
      const result = await create_network(data);

      sendNetworkData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  socket.on("delete_network", async (data, callback) => {
    try {
      const result = await delete_network(data);

      sendNetworkData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  socket.on("update_ip_address", async (data, callback) => {
    try {
      const result = await update_ip_address(data as any);

      // sendNetworkData(socket)

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  // device
  socket.on("create_device", async (data, callback) => {
    try {
      const result = await create_device(data);

      sendDeviceData(socket);
      sendNetworkData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  socket.on("delete_device", async (data, callback) => {
    try {
      const result = await delete_device(data);

      sendDeviceData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  socket.on("update_device", async (data, callback) => {
    try {
      const result = await update_device(data);

      sendDeviceData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  socket.on("delete_selected_device", async (data, callback) => {
    try {
      const result = await delete_selected_device(data);
      sendDeviceData(socket);

      callback(successResult(result));
    } catch (err) {}
  });

  socket.on("upload_device", async (data, callback) => {
    try {
      const result = await upload_device(data);

      sendDeviceData(socket);

      callback(result as any);
    } catch (err) {
      // callback(faildResult((err as Error).message))
    }
  });

  socket.on("find_device_history", async (data, callback) => {
    try {
      const result = await find_device_history(data);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  // device model
  socket.on("create_device_model", async (data, callback) => {
    try {
      const result = await create_device_model(data);

      sendDeviceModelData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  // user
  socket.on("create_user", async (data, callback) => {
    try {
      const result = await create_user(data);

      sendUserData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  socket.on("delete_user", async (data, callback) => {
    try {
      const result = await delete_user(data);

      sendUserData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  socket.on("update_user", async (data, callback) => {
    try {
      const result = await update_user(data);

      sendUserData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });

  // device status
  socket.on("create_device_status", async (data, callback) => {
    try {
      const result = await create_device_status(data);

      sendDeviceStatusData(socket);

      callback(successResult(result) as any);
    } catch (err) {
      callback(faildResult((err as Error).message));
    }
  });
});

httpServer.listen(3001, 0, () => {
  console.log(`The server run at http://localhost:3001`);
});

httpServer.on("error", (e) => {
  console.log(e.message);
});
