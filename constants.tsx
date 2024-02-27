import { TClipLanguages, TClipModels } from "./types";

type TCLIP_LANGUAGES = { [key in TClipLanguages]: string };
export const CLIP_LANGUAGES: TCLIP_LANGUAGES = {
  en: "English",
  id: "Bahasa",
};

type TCLIP_MODELS = { [key in TClipModels]: string };
export const CLIP_MODELS: TCLIP_MODELS = {
  v1: "V1",
  v2: "V2",
};
