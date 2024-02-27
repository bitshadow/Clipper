import { TMedia } from "@/global/types";
import { TStatuses } from "@/global/types/common";

export type TClipLanguages = "en" | "id";
export type TClipMediaTypes = "audio" | "video";
export type TClipModels = "v1" | "v2";
export type TCreateClipPayload = {
  objectId: string;
  language: TClipLanguages;
  mediaType: string;
  model: TClipModels;
};

export type TClip = {
  id?: string;
  startTime: number;
  endTime: number;
};

export type TClipTimeStamp = {
  id?: string;
  startTime: number;
  endTime: number;
};
export type TSummarizedMedia = {
  _id?: string;
  createdAt?: string;
  duration: number;
  language: TClipLanguages;
  mediaSize: number;
  mediaType?: TMedia;
  model?: TClipModels;
  name: string;
  objectId?: string;
  status: TStatuses;
  sugestedTimestamps?: TClipTimeStamp[];
  timestamps: TClipTimeStamp[];
  updatedAt?: string;
  url: string;
  userId?: string;
};

export type TSummarizedMediaPayload = {
  data: TSummarizedMedia[];
  total: number;
  limit: number;
};

type TExportedClips = {
  url: string;
  captions: string;
};
export type TExportedMedia = {
  _id: string;
  captions: boolean;
  clips: TExportedClips[];
  combined: boolean;
  mediaFileId: string;
  status: TStatuses;
  timestamps: TClipTimeStamp[];
  userId: string;
};

export type TMediaExportsPayload = {
  data: TExportedMedia[];
  total: number;
  limit: number;
};
