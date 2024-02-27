import Button from "@/global/components/button";
import { Divider, Typography, Upload, message } from "antd";
import { UploadOutlined, FileTwoTone } from "@ant-design/icons";
import { useLazyGetS3SignedUrlQuery } from "../services";
import { uploadFileToS3 } from "@/global/utility/helperFunctions";
import { TUploadedFile } from "@/global/types/common";
import { Icon } from "@/global/components/icons";

message.config({
  duration: 3,
  maxCount: 1,
});

const { Dragger } = Upload;
const { Text } = Typography;

type DragDropFileProps = {
  maxCount: number;
  onUploadSuccess?: (file: TUploadedFile[]) => void;
  uploadedFiles?: TUploadedFile[];
};
export const DragDropFile = ({
  onUploadSuccess,
  maxCount = 1,
  uploadedFiles = [],
}: DragDropFileProps) => {
  const [getSignedUrl] = useLazyGetS3SignedUrlQuery();

  const uploadProps = {
    name: "file",
    accept: "audio/mp3,video/mp4",
    multiple: maxCount > 1,
    maxCount,
    showUploadList: {
      showPreviewIcon: false,
      downloadIcon: false,
      showRemoveIcon: false,
    },
    beforeUpload(file: File) {
      const is5GB = file.size / 1024 / 1024 / 1024 < 5;
      if (!is5GB) {
        message.warning("File is too large. File size exceeds limit of 5GB.");
      }

      // add check for file size validation here
      return is5GB;
    },
    onChange({ file, event }: any) {
      const status = file.status;
      if (status === "uploading") {
        const percent = event ? parseInt(event.percent, 10) : 0;
      } else if (status === "done") {
        message.success(`${file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${file.name} file upload failed.`);
      }
    },
    iconRender: (file: any) => {
      const { status } = file;
      return status === "uploading" ? <Icon name="upload" /> : <FileTwoTone />;
    },
    customRequest: ({ file, onError, onProgress, onSuccess }: any) => {
      const extension = file.name.split(".").pop();
      getSignedUrl({ extension, contentType: file.type })
        .then(({ data }) => {
          if (data && data.signedUrl) {
            return uploadFileToS3({
              url: data.signedUrl,
              file,
              extraData: data,
              onProgress,
            });
          }

          throw new Error("Upload failed");
        })
        .then((result: any) => {
          onSuccess("uploaded successfully", file);
          onUploadSuccess?.([...uploadedFiles, { ...result }]);
        })
        .catch((error) => {
          onError("Upload failed.");
        });
    },
  };

  return (
    <div style={{ width: 250 }}>
      <Dragger
        listType="picture-card"
        {...uploadProps}
        style={{ borderRadius: 8, marginTop: 10 }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <Text>Drag and drop a media file here</Text>
        <Divider style={{ margin: "16px 0 4px" }} />
        <Button type="link" style={{ color: "white" }}>
          or Browse from computer
        </Button>
      </Dragger>
    </div>
  );
};
