import {
  Timeline,
  TimelineAction,
  TimelineEffect,
  TimelineRow,
} from "@xzdarcy/react-timeline-editor";
import { useEffect, useRef, useState } from "react";
import TimelinePlayer from "./TimelinePlayer";
import { cloneDeep, every, minBy, some } from "lodash";
import { Slider } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Action } from "./Action";
import shortid from "shortid";
import styles from "./index.module.scss";
import { TClip, TClipMediaTypes } from "../../types";

const CLIPS_ROW_ID = "clips_row";
const MEDIA_ROW_ID = "media_row";

export const EFFECT_CLIP = "clip";
export const EFFECT_FULL_MEDIA = "full";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 100;
export const DEFAULT_ZOOM = 90;
export const SCALE = 10;
export const SCALE_WIDTH = 150;
export const SCALE_SPLIT_COUNT = 10;

type MediaClipEditorProps = {
  source: string;
  duration: number;
  mediaType: TClipMediaTypes;
  clips: TClip[];
  summarizedClips: TClip[];
  onChange?: (clips: TClip[]) => void;
};
export const MediaClipEditor = ({
  source: mediaSrc,
  duration: mediaDuration,
  clips: defaultClips,
  summarizedClips,
  mediaType,
  onChange,
}: MediaClipEditorProps) => {
  const [clips] = useState(defaultClips);

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [scale, setScale] = useState(DEFAULT_ZOOM * 10);
  const [currentTime, setCurrentTime] = useState(0);
  const timelineRows: TimelineRow[] = [
    {
      id: CLIPS_ROW_ID,
      actions: clips.map((clip) => {
        return {
          id: clip.id || shortid.generate(),
          start: clip.startTime,
          end: clip.endTime,
          maxEnd: mediaDuration,
          effectId: EFFECT_CLIP,
        };
      }),
      rowHeight: 80,
    },
    {
      id: MEDIA_ROW_ID,
      actions: [
        {
          id: shortid.generate(),
          start: 0,
          end: mediaDuration,
          maxEnd: mediaDuration,
          movable: false,
          flexible: false,
          effectId: EFFECT_FULL_MEDIA,
        },
      ],
      rowHeight: 30,
    },
  ];

  const actionEffects: Record<string, TimelineEffect> = {
    clip: {
      id: EFFECT_CLIP,
      name: "2",
    },
    full: {
      id: EFFECT_FULL_MEDIA,
      name: "1",
    },
  };

  const timelineState = useRef<any>();
  const [rows, setRows] = useState(cloneDeep(timelineRows));

  const CustomScale = (props: { scale: number }) => {
    const { scale } = props;
    const min = parseInt(scale / 60 + "");
    const second = ((scale % 60) + "").padStart(2, "0");
    return <>{`${min}:${second}`}</>;
  };

  const handleChange = (actions: TimelineAction[]) => {
    onChange?.(
      actions.map((action: TimelineAction) => {
        return {
          id: action.id,
          startTime: action.start,
          endTime: action.end,
        };
      }),
    );
  };

  const selectAction = (currentAction: TimelineAction, row: TimelineRow) => {
    if (currentAction.effectId !== EFFECT_CLIP) return;

    setRows((prevRows) => {
      const rowIndex = prevRows.findIndex((item) => item.id === row.id);

      const actions = row.actions.map((action) => {
        return {
          ...action,
          selected: action.id === currentAction.id,
        };
      });
      handleChange(row.actions);
      setCurrentTime(currentAction.start);
      prevRows[rowIndex] = { ...row, actions: actions };
      return [...prevRows];
    });
  };

  const deleteAction = (currentAction: TimelineAction, row: TimelineRow) => {
    if (currentAction.effectId !== EFFECT_CLIP) return;
    setRows((prevRows) => {
      const rowIndex = prevRows.findIndex((item) => item.id === row.id);

      const actions = row.actions.filter((action) => {
        return action.id !== currentAction.id;
      });

      handleChange(actions);
      prevRows[rowIndex] = { ...row, actions: actions };
      return [...prevRows];
    });
  };

  const addAction = (row: TimelineRow, time: number) => {
    if (time >= mediaDuration) return;

    // if double click on existing clip return
    if (
      some(row.actions, (action) => action.start <= time && action.end >= time)
    ) {
      return;
    }

    // next minimum greater than time
    const nextMin = minBy(
      row.actions.filter((action) => action.start > time),
      "start",
    )?.start;

    setRows((pre) => {
      const rowIndex = pre.findIndex((item) => item.id === row.id);
      const newAction: TimelineAction = {
        id: shortid.generate(),
        start: time,
        end: Math.min(time + 100, mediaDuration, nextMin || mediaDuration),
        effectId: EFFECT_CLIP,
        maxEnd: mediaDuration,
      };

      const rowActions = row.actions.concat(newAction);
      pre[rowIndex] = { ...row, actions: rowActions };
      setCurrentTime(time);
      handleChange(rowActions);
      return [...pre];
    });
  };

  useEffect(() => {
    setScale((MAX_ZOOM - zoom) * 10);
  }, [zoom]);

  const handleReset = () => {
    setRows((prevRows) => {
      const rowIndex = prevRows.findIndex((item) => item.id === CLIPS_ROW_ID);

      const timelineActions: TimelineAction[] = summarizedClips.map((clip) => {
        return {
          id: clip?.id || shortid.generate(),
          start: clip.startTime,
          end: clip.endTime,
          maxEnd: mediaDuration,
          effectId: EFFECT_CLIP,
        };
      });

      handleChange(timelineActions);
      prevRows[rowIndex] = { ...prevRows[rowIndex], actions: timelineActions };
      return [...prevRows];
    });
  };

  return (
    <div className={styles["media-timeline"]}>
      <TimelinePlayer
        timelineState={timelineState}
        src={mediaSrc}
        mediaType={mediaType}
        currentTime={currentTime}
        onReset={() => {
          handleReset();
        }}
      />
      <Timeline
        style={{ width: "100%", height: 155 }}
        onChange={(rows) => {
          setRows(rows);
          handleChange(rows[0].actions);
        }}
        ref={timelineState}
        editorData={rows}
        effects={actionEffects}
        autoScroll={true}
        scale={scale}
        scaleWidth={SCALE_WIDTH}
        scaleSplitCount={SCALE_SPLIT_COUNT}
        getActionRender={(action, row) => {
          return (
            <Action
              action={action}
              row={row}
              onDelete={() => deleteAction(action, row)}
            />
          );
        }}
        onActionResizeEnd={({ action, row }) => {
          selectAction(action, row);
        }}
        onActionMoveEnd={({ action, row }) => {
          selectAction(action, row);
        }}
        onClickActionOnly={(e, { action, row }) => {
          selectAction(action, row);
        }}
        onDoubleClickRow={(e, { row, time }) => {
          if (row.id !== CLIPS_ROW_ID) return;
          addAction(row, time);
        }}
        dragLine
        onClickTimeArea={(time) => {
          setCurrentTime(time);
          return false;
        }}
        onCursorDragEnd={(time) => setCurrentTime(time)}
        getScaleRender={(scale) => <CustomScale scale={scale} />}
      />
      <div style={{ display: "flex" }}>
        <ZoomOutOutlined
          style={{ color: "white", fontSize: 18 }}
          onClick={() => setZoom(zoom - 1)}
        />
        <Slider
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          onChange={(value) => {
            setZoom(value);
          }}
          value={zoom}
          style={{ width: "100%" }}
        />
        <ZoomInOutlined
          style={{ color: "white", fontSize: 18 }}
          onClick={() => setZoom(zoom + 1)}
        />
      </div>
    </div>
  );
};
