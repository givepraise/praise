export enum SOURCE_PLATFORM {
  Discord = "DISCORD",
  Telegram = "TELEGRAM",
}

export interface Source {
  id: number;
  name: string;
  channelId: string;
  channelName: string;
  platform: SOURCE_PLATFORM;
}
