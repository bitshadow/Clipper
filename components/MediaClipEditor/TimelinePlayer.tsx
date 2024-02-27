import Button from "@/global/components/button";
import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { TimelineState } from "@xzdarcy/react-timeline-editor";
import { Space, Spin, Typography, theme } from "antd";
import Hls from "hls.js";
import React, {
  FC,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { WaveForm } from "../Waveforms";
import { getClockTimeFromSeconds } from "@/global/utility/helperFunctions";
import { TClipMediaTypes } from "../../types";
export const scaleWidth = 160;
export const scale = 5;
export const startLeft = 20;

const { Text } = Typography;
type TMediaEvent = SyntheticEvent<HTMLAudioElement | HTMLVideoElement>;
const TimelinePlayer: FC<{
  timelineState: React.MutableRefObject<TimelineState>;
  src: string;
  mediaType: TClipMediaTypes;
  currentTime: number;
  onReset?: () => void;
}> = ({ timelineState, src, currentTime, mediaType, onReset }) => {
  const [time, setTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    token: { colorPrimary },
  } = theme.useToken();

  // analyzer
  const mediaRef = useRef<any>(null);
  const mediaSourceRef = useRef<any>(null);
  const [analyzerData, setAnalyzerData] = useState<any>(null);

  const connectAudioAnalyzer = useCallback(() => {
    const audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    // create an analyzer node with a buffer size of 2048
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 2048;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (!mediaSourceRef.current) {
      mediaSourceRef.current = audioCtx.createMediaElementSource(
        mediaRef.current,
      );
      mediaSourceRef.current.disconnect();
      mediaSourceRef.current.connect(analyzer);
      mediaSourceRef.current.connect(audioCtx.destination);
      (mediaSourceRef.current as any).onended = () => {
        mediaSourceRef.current.disconnect();
      };
    }

    // set the analyzerData state with the analyzer, bufferLength, and dataArray
    setAnalyzerData({ analyzer, dataArray });
  }, []);

  useEffect(() => {
    if (
      src &&
      mediaRef.current &&
      !mediaSourceRef.current &&
      mediaType === "audio"
    ) {
      connectAudioAnalyzer();
    }
  }, [src, connectAudioAnalyzer, mediaType]);

  useEffect(() => {
    const playerEl = document.getElementById(
      `${mediaType}-timeline-player`,
    ) as HTMLMediaElement;

    if (!playerEl) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(playerEl);
    } else if (playerEl.canPlayType("application/vnd.apple.mpegurl")) {
      playerEl.src = src;
    }
  }, [src, mediaType]);

  useEffect(() => {
    if (!mediaRef || !mediaRef.current || !isReady || currentTime > duration)
      return;

    setTime(currentTime);
    mediaRef.current.currentTime = currentTime;
    timelineState.current.setTime(currentTime);
  }, [currentTime, isReady, timelineState, duration]);

  const handlePlayOrPause = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current?.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current?.play();
      setIsPlaying(true);
    }
  };

  const mediaProps = {
    id: `${mediaType}-timeline-player`,
    ref: mediaRef,
    onDurationChange: (e: TMediaEvent) => setDuration(e.currentTarget.duration),
    onSeeking: () => {
      setIsBuffering(true);
    },
    onSeeked: () => {
      setIsBuffering(false);
    },
    onCanPlay: () => {
      setIsReady(true);
      setIsBuffering(false);
    },
    onTimeUpdate: (e: TMediaEvent) => {
      setTime(e.currentTarget.currentTime);
      timelineState.current.setTime(e.currentTarget.currentTime);
    },
    onPlaying: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    style: { maxHeight: 450 },
  };
  let mediaEl = null;

  if (mediaType === "video") {
    mediaEl = <video {...mediaProps} />;
  } else {
    mediaEl = (
      <>
        {analyzerData && (
          <WaveForm analyzerData={analyzerData} isPlaying={isPlaying} />
        )}
        <audio {...mediaProps} />
      </>
    );
  }
  return (
    <>
      <Space
        style={{
          width: "100%",
          height: 400,
          borderRadius: 4,
          justifyContent: "center",
        }}
      >
        {mediaEl}
      </Space>
      <Space
        className="timeline-player"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space align="center">
          <Text
            onClick={handlePlayOrPause}
            style={{ fontSize: 25, cursor: "pointer" }}
          >
            {isBuffering ? (
              <Spin />
            ) : isPlaying ? (
              <PauseCircleOutlined />
            ) : (
              <PlayCircleOutlined />
            )}
          </Text>
          <span>
            <Text className="time">
              {getClockTimeFromSeconds(time)} -{" "}
              {getClockTimeFromSeconds(duration)}
            </Text>
          </span>
        </Space>
        {onReset && (
          <Space
            style={{ width: "100%", justifyContent: "space-between" }}
            align="center"
          >
            <Button
              onClick={onReset}
              type="text"
              style={{ color: colorPrimary }}
            >
              RESET CLIPS
            </Button>
          </Space>
        )}
      </Space>
    </>
  );
};

export default TimelinePlayer;
