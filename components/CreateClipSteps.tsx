import { InputNumber, Steps, Typography } from "antd";
import { useState } from "react";
import { TCreateClipPayload } from "../types";
import { DragDropFile } from "./DragDropFile";
import { LanguageSelect, ModelSelect } from "./ButtonSelect";
import { ClipInputContainer } from "./ClipInputContainer";
import { TUploadedFile } from "@/global/types/common";
import { ClipsCount } from "./ClipsCount";

const { Text } = Typography;

const INITIAL_STEP = 0;
type CreateStepsProps = {
  value: TCreateClipPayload | null;
  onChange?: (payload: TCreateClipPayload | null) => void;
};
export const CreateSteps = ({ onChange, value }: CreateStepsProps) => {
  const payload = (value as TCreateClipPayload) || {};
  const [uploadedFiles, setUploadedFiles] = useState<TUploadedFile[]>([]);

  const getCurrentStep = () => {
    const isStep1Filled = !!payload.objectId && !!payload.mediaType;
    const isStep2Filled = isStep1Filled && !!payload.language;

    if (isStep2Filled) {
      return 2;
    }

    if (isStep1Filled) {
      return 1;
    }

    return INITIAL_STEP;
  };

  const items = [
    {
      title: <Text>Which Media would you like to use?</Text>,
      description: (
        <ClipInputContainer>
          <DragDropFile
            maxCount={1}
            uploadedFiles={uploadedFiles}
            onUploadSuccess={(files: TUploadedFile[]) => {
              setUploadedFiles(files);
              if (files.length >= 1) {
                const file = files[0];
                onChange?.({
                  ...payload,
                  objectId: file._id,
                  mediaType: file.contentType.substring(
                    0,
                    file.contentType.indexOf("/"),
                  ),
                });
              }
            }}
          />
        </ClipInputContainer>
      ),
    },
    {
      title: <Text>What is the video language?</Text>,
      description: (
        <ClipInputContainer>
          <LanguageSelect
            value={payload.language}
            onChange={(language) => onChange?.({ ...payload, language })}
          />
        </ClipInputContainer>
      ),
    },
  ];

  return (
    <Steps
      direction="vertical"
      current={getCurrentStep()}
      items={items.slice(0, getCurrentStep() + 1)}
    />
  );
};
