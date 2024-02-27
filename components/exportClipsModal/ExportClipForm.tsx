import {
  Card,
  Checkbox,
  Divider,
  List,
  Radio,
  Space,
  Typography,
  theme,
} from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { useState } from "react";
import Button from "@/global/components/button";

const { Title, Paragraph } = Typography;
export type TOnExportParams = {
  combined: boolean;
  captions: boolean;
};

type ExportClipForm = {
  onExport: (payload: TOnExportParams) => void;
  isLoading?: boolean;
  clipsCount: number;
};

export const ExportClipForm = ({
  onExport,
  isLoading,
  clipsCount,
}: ExportClipForm) => {
  const [combined, setCombined] = useState(false);
  const [captions, setCaptions] = useState(false);

  const {
    token: { colorPrimary, colorBorder },
  } = theme.useToken();

  const combinedOptions = [
    {
      value: true,
      icon: <PaperClipOutlined style={{ fontSize: 28 }} />,
      label: (
        <span style={{ textAlign: "center", fontWeight: "600" }}>
          As one
          <br />
          single media file
        </span>
      ),
    },
    {
      value: false,
      icon: (
        <span>
          <PaperClipOutlined style={{ fontSize: 28 }} />
          <PaperClipOutlined style={{ fontSize: 28 }} />
        </span>
      ),
      label: (
        <span style={{ textAlign: "center", fontWeight: "600" }}>
          As multiple
          <br />
          media clips ({clipsCount})
        </span>
      ),
    },
  ];

  const captionOptions = [
    {
      value: true,
      label: <span>YES</span>,
    },
    {
      value: false,
      label: <span>NO</span>,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        padding: "30px 30px 30px 10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title level={4}>Export Preferences</Title>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          marginTop: 50,
        }}
      >
        {combinedOptions.map((option, key) => {
          const isSelected = option.value === combined;
          const borderStyle = {
            border: `1px solid ${isSelected ? colorPrimary : colorBorder}`,
            background: `${isSelected ? "rgba(0, 0, 0, 0.5)" : "transparent"}`,
          };

          return (
            <div
              key={String(key)}
              style={{ ...(styles.box as React.CSSProperties), ...borderStyle }}
              onClick={() => setCombined(option.value)}
            >
              {option.icon}
              {option.label}
            </div>
          );
        })}
      </div>
      <br />
      <Divider style={styles.divider} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        Include Closed Captions?{" "}
        <Radio.Group
          onChange={(e) => setCaptions(e.target.value)}
          value={captions}
        >
          {captionOptions.map((option, key) => {
            return (
              <Radio value={option.value} key={String(key)}>
                {option.label}
              </Radio>
            );
          })}
        </Radio.Group>
      </div>
      <Divider style={styles.divider} />
      <Button
        type="primary"
        loading={isLoading}
        onClick={() => onExport({ captions, combined })}
        disabled={isLoading}
      >
        Export
      </Button>
    </div>
  );
};

const styles = {
  box: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    border: "1px solid #aaa",
    width: 130,
    height: 130,
    padding: 10,
    cursor: "pointer",
    borderRadius: 8,
  },
  divider: {
    margin: "15px 0",
  },
};
