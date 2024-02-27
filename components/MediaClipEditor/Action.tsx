import classNames from "classnames";
import { TimelineAction, TimelineRow } from "@xzdarcy/react-timeline-editor";
import { DeleteFilled } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { EFFECT_FULL_MEDIA } from ".";
import { getClockTimeFromSeconds } from "@/global/utility/helperFunctions";
import { CSSProperties } from "react";

const { Text, Paragraph } = Typography;
type ActionProps = {
  action: TimelineAction;
  row: TimelineRow;
  onDelete?: (action: TimelineAction, row: TimelineRow) => void;
};
export const Action = ({ action, row, onDelete }: ActionProps) => {
  const duration = Math.max(action.end - action.start, 0);
  const timeStyle: CSSProperties = {
    position: "absolute",
    fontSize: 10,
    top: 0,
    zIndex: 1,
  };

  const el = (
    <>
      <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
        {action.selected ? (
          <>
            <Text
              style={{
                ...timeStyle,
                right: 0,
                transform: "translateX(105%)",
              }}
            >
              {getClockTimeFromSeconds(action.end)}
            </Text>
            <Text
              style={{
                ...timeStyle,
                left: 0,
                transform: "translateX(-105%)",
              }}
            >
              {getClockTimeFromSeconds(action.start)}
            </Text>
          </>
        ) : null}
        <Text strong>{duration.toFixed(0)} s</Text>
      </Paragraph>
      {action.selected && !action.disable && (
        <DeleteFilled
          style={{ color: "white" }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(action, row);
          }}
        />
      )}
    </>
  );

  if (action.effectId === EFFECT_FULL_MEDIA)
    return (
      <Paragraph
        ellipsis={{ rows: 1 }}
        style={{ marginBottom: 0, textAlign: "center" }}
      >
        <Text strong>Duration: {getClockTimeFromSeconds(action.end)}</Text>
      </Paragraph>
    );
  return (
    <Space
      className={classNames({ selected: action.selected })}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {el}
    </Space>
  );
};
