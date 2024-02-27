import { Space } from "antd";
import { CLIP_LANGUAGES, CLIP_MODELS } from "../constants";
import { TClipLanguages, TClipModels } from "../types";
import Button from "@/global/components/button";
import _ from "lodash";

type LanguageSelectProps = {
  value?: TClipLanguages;
  onChange?: (language: TClipLanguages) => void;
};
export const LanguageSelect = ({ value, onChange }: LanguageSelectProps) => {
  return (
    <Space direction="horizontal">
      {_.map(CLIP_LANGUAGES, (label, key) => {
        return (
          <Button
            key={key}
            type={value === key ? "primary" : "default"}
            onClick={() => onChange?.(key as TClipLanguages)}
            style={{ marginRight: 10 }}
          >
            {label}
          </Button>
        );
      })}
    </Space>
  );
};

type ModelSelectProps = {
  value?: TClipModels;
  onChange?: (language: TClipModels) => void;
};
export const ModelSelect = ({ value, onChange }: ModelSelectProps) => {
  return (
    <Space direction="horizontal">
      {_.map(CLIP_MODELS, (label, key) => {
        return (
          <Button
            key={key}
            type={value === key ? "primary" : "default"}
            onClick={() => onChange?.(key as TClipModels)}
            style={{ marginRight: 10 }}
          >
            {label}
          </Button>
        );
      })}
    </Space>
  );
};
