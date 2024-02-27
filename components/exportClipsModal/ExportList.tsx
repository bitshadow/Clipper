import PaginatedList, {
  PaginatedListProps,
} from "@/global/components/paginatedList";
import { TExportedMedia } from "../../types";
import { Image, List, Space, message } from "antd";
import moment from "moment";
import { STATUS_COLOR_MAP } from "@/global/constants";
import { humanizeStatus } from "@/global/utility";
import Button from "@/global/components/button";
import { downloadFileFromUrl } from "@/global/utility/helperFunctions";
import { useState } from "react";

type ExportListProps = Omit<
  PaginatedListProps<TExportedMedia>,
  "renderItem"
> & {
  items: TExportedMedia[];
  isLoading?: boolean;
};
export const ExportList = ({
  items,
  isLoading,
  total,
  limit,
  page,
  setPage,
}: ExportListProps) => {
  const defaultDownloadState = {
    _id: "",
    inProgress: false,
    percent: 0,
  };
  const [downloading, setDownload] = useState(defaultDownloadState);
  const resetDownload = () => setDownload(defaultDownloadState);

  return (
    <div
      style={{
        width: "100%",
        borderRight: "1px solid rgba(255,255,255,.08)",
        display: "flex",
        marginRight: 20,
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Image
        src="/images/download-cloud.svg"
        width={112}
        preview={false}
        alt="Download"
      />
      <PaginatedList
        dataSource={items || []}
        loading={isLoading}
        total={total}
        limit={limit}
        page={page}
        setPage={setPage}
        style={{ overflow: "auto", width: "100%", paddingBottom: 20 }}
        pagination={{
          size: "small",
          align: "center",
        }}
        renderItem={(item: any) => {
          const { status, timestamps, createdAt, combined, captions } = item;
          const isDownloading =
            downloading._id === item._id && downloading.inProgress;
          return (
            <div
              style={{
                width: "100%",
                padding: "12px 16px",
                display: "flex",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                flexDirection: "column",
                color: "#FFF",
                lineHeight: "16px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <p>
                  {combined ? "Single Media" : `${timestamps.length} Clips`}{" "}
                  {captions ? "(Captions)" : ""}
                </p>
                {status !== "Completed" ? (
                  <div
                    style={{
                      color: STATUS_COLOR_MAP[status],
                      fontStyle: "italic",
                    }}
                  >
                    {humanizeStatus(status)}
                  </div>
                ) : (
                  <Button
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                    onClick={() => {
                      if (!item.export && !item.export.url) {
                        message.error("No Downloadable url found.");
                      }

                      setDownload({
                        _id: item._id,
                        percent: 0,
                        inProgress: true,
                      });
                      downloadFileFromUrl(item.export.url, (percentage) => {
                        setDownload({
                          _id: item._id,
                          percent: percentage,
                          inProgress: true,
                        });
                      })
                        .catch(() => {
                          message.error(
                            "Error while downloading file. Try again later.",
                          );
                          resetDownload();
                        })
                        .finally(() => {
                          resetDownload();
                        });
                    }}
                    disabled={downloading._id === item._id}
                  >
                    {isDownloading
                      ? `Downloading ${downloading.percent}%`
                      : "Download"}
                  </Button>
                )}
              </Space>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "400",
                  fontSize: "12px",
                }}
              >
                <div style={{ color: "#707785" }}>
                  {moment.utc(createdAt).fromNow()}
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
