import type {
  Device,
  DeviceCreateInput,
  DeviceModel,
  DeviceModelCreateInput,
  DeviceStatus,
  DeviceStatusCreateInput,
  UploadDeviceInput,
} from "./device";
import type { IpAddress, Network, NetworkCreateInput } from "./network";
import type { Result } from "./result";
import type { User, UserCreateInput } from "./user";

export interface ServerToClientEvents {
  basicEmit: (a: number, b: string, c: Buffer) => void;

  find_user: (response: Result<User[]>) => void;
  find_device: (response: Result<Device[]>) => void;
  find_network: (response: Result<Network[]>) => void;
  find_ip_address: (response: Result<IpAddress[]>) => void;
  find_device_model: (response: Result<DeviceModel[]>) => void;
  find_device_status: (response: Result<DeviceStatus[]>) => void;
}

type D = keyof ServerToClientEvents;

export interface ClientToServerEvents {
  get_data: (data: D[]) => void;

  // network
  create_network: (
    data: NetworkCreateInput,
    callback: (response: Result<Network>) => void
  ) => void;

  delete_network: (
    data: { id: string },
    callback: (response: Result<any>) => void
  ) => void;

  update_ip_address: (
    data: IpAddress,
    callback: (response: Result<IpAddress>) => void
  ) => void;

  // user
  create_user: (
    data: UserCreateInput,
    callback: (response: Result<User>) => void
  ) => void;

  delete_user: (data: User, callback: (response: Result<User>) => void) => void;

  update_user: (data: User, callback: (response: Result<User>) => void) => void;

  // device
  create_device: (
    data: DeviceCreateInput,
    callback: (response: Result<Device>) => void
  ) => void;

  delete_device: (
    data: Device,
    callback: (response: Result<Device>) => void
  ) => void;

  find_device_history: (
    data: { id: string | null },
    response: (response: Result<Device[]>) => void
  ) => void;

  update_device: (
    data: Device,
    callback: (response: Result<Device>) => void
  ) => void;

  delete_selected_device: (
    data: { id: string }[],
    callback: (response: Result<any>) => void
  ) => void;

  upload_device: (
    data: UploadDeviceInput[],
    callback: (response: Result<UploadDeviceInput | Device>[]) => void
  ) => void;

  // device model
  create_device_model: (
    data: DeviceModelCreateInput,
    callback: (response: Result<DeviceModel>) => void
  ) => void;

  // device status
  create_device_status: (
    data: DeviceStatusCreateInput,
    callback: (response: Result<DeviceStatus>) => void
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
