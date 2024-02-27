import WithLoader from "@/global/components/withLoader";
import { useEffect, useState } from "react";
import { Layout, Space, Typography, message } from "antd";
import { useRouter } from "next/router";
import Button from "@/global/components/button";
import {
  useLazyGetSummarizedMediaQuery,
  useLazyUpdateSummarizedMediaQuery,
} from "./services";
import { useDispatch } from "react-redux";
import { TClipTimeStamp } from "./types";
import { ClipsSelector } from "./components/ClipsSelector";
import FullScreenLoader from "@/global/components/fullscreenLoader";
import { ExportClipModal } from "./components/exportClipsModal/ExportClipsModal";
import { MediaClipEditor } from "./components/MediaClipEditor";
import shortid from "shortid";

const { Paragraph } = Typography;
const { Header, Content } = Layout;

const getDefaultTimestamps = (timestamps: TClipTimeStamp[]) => {
  return timestamps.map((timestamp) => {
    return {
      id: shortid.generate(),
      startTime: timestamp.startTime,
      endTime: timestamp.endTime,
    };
  });
};
export const EditMedia = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const mediaId = router.query.mediaId;
  const [showClips, setShowClips] = useState(false);
  const [getSummarizedMediaApi, { data: mediaData, isFetching }] =
    useLazyGetSummarizedMediaQuery();
  const [updateSummarizedMedia, { isFetching: isSaving }] =
    useLazyUpdateSummarizedMediaQuery();

  // media information
  const [name, setName] = useState("");
  const [timestamps, setTimestamps] = useState<TClipTimeStamp[] | null>(null);

  const [selectedClips, setSelectedClips] = useState<TClipTimeStamp[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    getSummarizedMediaApi(mediaId);
  }, [mediaId, getSummarizedMediaApi]);

  useEffect(() => {
    if (!mediaData) return;

    if (mediaData._id) {
      setTimestamps(getDefaultTimestamps(mediaData?.timestamps));
      setName(mediaData?.name);
    }
    if (
      mediaData &&
      mediaData.sugestedTimestamps.length === 0 &&
      mediaData.timestamps.length === 0
    ) {
      message.warning(
        "Warning! We couldn't identify key segments in this video since it was too short",
        10,
      );
    }
  }, [mediaData, dispatch]);

  const saveName = (mediaName: string) => {
    updateSummarizedMedia({ mediaId: mediaData?._id, name: mediaName }).then(
      (resp) => {
        if (resp?.data?.success) {
          message.success("Successfully updated name.");
        }
      },
    );
  };

  const handleSave = () => {
    updateSummarizedMedia({ mediaId: mediaData?._id, timestamps, name }).then(
      (resp) => {
        if (resp?.data?.success) {
          message.success("Successfully updated changes.");
        }
      },
    );
  };

  if (!(mediaData && mediaData._id && timestamps) || isFetching) {
    return <FullScreenLoader size="large" />;
  }

  return (
    <WithLoader isLoading={isFetching}>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            height: "auto",
            padding: "16px 64px",
            background: "#111315",
            borderBottom: "1px solid #222526",
          }}
        >
          <Space
            direction="horizontal"
            style={{
              justifyContent: "space-between",
              width: "100%",
            }}
            wrap
          >
            <Paragraph
              editable={{
                onChange: (name) => {
                  setName(name);
                  saveName(name);
                },
              }}
              style={{
                marginBottom: 0,
                fontSize: 20,
                fontWeight: 300,
                minWidth: 500,
              }}
            >
              {name}
            </Paragraph>
            <span>
              <Button
                style={{ fontWeight: "bold" }}
                onClick={handleSave}
                type="primary"
                loading={isSaving}
                disabled={isSaving}
              >
                SAVE
              </Button>
            </span>
          </Space>
        </Header>
        <Content style={{ padding: "32px 64px", background: "#0f1112" }}>
          {mediaData?.timestamps && (
            <MediaClipEditor
              source={mediaData?.url}
              duration={mediaData?.duration}
              mediaType={mediaData?.mediaType}
              clips={mediaData.timestamps}
              summarizedClips={mediaData?.sugestedTimestamps}
              onChange={(clips) => {
                setTimestamps(clips);
              }}
            />
          )}
          {timestamps && (
            <Space
              direction="horizontal"
              style={{
                width: "100%",
                justifyContent: "center",
                margin: "10px 0 50px",
              }}
            >
              <Button
                onClick={() => {
                  setShowClips(true);
                  setSelectedClips(timestamps);
                  document
                    .getElementById("clip-selector")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                USE {timestamps.length} CLIPS
              </Button>
            </Space>
          )}
          {
            <div
              id="clip-selector"
              style={{ visibility: showClips ? "visible" : "hidden" }}
            >
              <ClipsSelector
                src={mediaData?.url}
                mediaType={mediaData.mediaType}
                items={timestamps}
                selectedItems={selectedClips}
                onChange={(clips: TClipTimeStamp[]) => {
                  setSelectedClips(clips);
                }}
              />
              {selectedClips.length > 0 && (
                <Space
                  direction="horizontal"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    margin: "10px 0 50px",
                  }}
                >
                  <Button
                    onClick={() => {
                      setShowExportModal(true);
                    }}
                  >
                    EXPORT {selectedClips.length} CLIPS
                  </Button>
                </Space>
              )}
            </div>
          }
          {showExportModal && (
            <ExportClipModal
              onClose={() => setShowExportModal(false)}
              media={mediaData}
              clips={selectedClips}
            />
          )}
        </Content>
      </Layout>
    </WithLoader>
  );
};
