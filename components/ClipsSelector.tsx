import { BGImage } from "@/global/components/BGImage";
import { TClipMediaTypes, TClipTimeStamp } from "../types";
import { List, Checkbox, Space, theme, Typography } from "antd";
import { Icon } from "@/global/components/icons";
import { useState } from "react";
import { getClockTimeFromSeconds } from "@/global/utility/helperFunctions";

const { Text } = Typography;
type TClipsSelector = {
  src: string;
  items: TClipTimeStamp[];
  selectedItems: TClipTimeStamp[];
  onChange: (selectedClips: TClipTimeStamp[]) => void;
  mediaType: TClipMediaTypes;
};
export const ClipsSelector = ({
  items,
  onChange,
  selectedItems,
}: TClipsSelector) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const handleItemSelection = (checked: boolean, item: TClipTimeStamp) => {
    if (checked) {
      onChange([...selectedItems, item]);
    } else {
      onChange(
        selectedItems.filter((selectedItem) => selectedItem.id !== item.id),
      );
    }
  };

  return (
    <List
      dataSource={items}
      renderItem={(item) => {
        const isSelected =
          selectedItems.findIndex(
            (selectedItem) => item.id === selectedItem.id,
          ) >= 0;
        return (
          <List.Item>
            <div
              style={{
                padding: 16,
                width: 200,
                background: colorBgContainer,
                border: "none",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <BGImage
                src="/images/statuses/default-NA.png"
                style={{ width: "100%", height: 100 }}
              />
              <Space
                style={{
                  width: "100%",
                  justifyContent: "center",
                  margin: "10px 0",
                }}
              >
                <Text>
                  {getClockTimeFromSeconds(item.startTime)} -{" "}
                  {getClockTimeFromSeconds(item.endTime)}
                </Text>
              </Space>
              <Checkbox
                onChange={(e) => handleItemSelection(e.target.checked, item)}
                checked={isSelected}
              />
            </div>
          </List.Item>
        );
      }}
      grid={{
        gutter: 32,
        xs: 1,
        sm: 2,
        md: 5,
        lg: 5,
      }}
    />
  );
};
