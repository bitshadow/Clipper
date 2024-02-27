import { Modal, Typography } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import {
  useExportMediaMutation,
  useLazyGetMediaExportsListQuery,
} from "../../services";
import {
  TClipTimeStamp,
  TExportedMedia,
  TMediaExportsPayload,
  TSummarizedMedia,
} from "../../types";
import { useEffect, useState } from "react";
import { ExportClipForm, TOnExportParams } from "./ExportClipForm";
import { ExportList } from "./ExportList";
import { getConstant } from "@/global/constants";

const INITIAL_PAGE = 1;

export type ExportClipModalProps = {
  onClose: () => void;
  onExportSuccess?: () => void;
  clips: TClipTimeStamp[];
  media?: TSummarizedMedia;
};
export const ExportClipModal = (props: ExportClipModalProps) => {
  const { onClose, media, clips } = props;
  const [page, setPage] = useState(INITIAL_PAGE);
  const [isPolling, setPolling] = useState(false);
  const [exportAPI, { isLoading }] = useExportMediaMutation();
  const [getExportsApi, { data: payload, isLoading: isFetching }] =
    useLazyGetMediaExportsListQuery({
      pollingInterval: isPolling ? getConstant("pollingInterval") : 0,
    });

  const onExport = (payload: TOnExportParams) => {
    exportAPI({
      mediaId: media?._id,
      timestamps: clips,
      ...payload,
    });
  };

  const {
    data: exports = [],
    total,
    limit = 10,
  }: TMediaExportsPayload = payload || {};

  useEffect(() => {
    getExportsApi({
      mediaId: media?._id,
      page,
      limit,
      sortKey: "createdAt",
      sortOrder: "desc",
    });
  }, [getExportsApi, page, limit, media?._id]);

  useEffect(() => {
    if (!exports) {
      setPolling(false);
      return;
    }
    const inProgressVideosCount = exports.filter((media: TExportedMedia) => {
      return media.status === "InProgress";
    }).length;

    setPolling(inProgressVideosCount > 0);
  }, [exports]);

  return (
    <Modal
      open
      footer={null}
      onCancel={onClose}
      width={840}
      bodyStyle={{ height: 500, overflow: "hidden", width: "auto", padding: 0 }}
      className="export-clip-modal"
      closeIcon={<CloseCircleOutlined style={{ fontSize: 20 }} />}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
        }}
      >
        <ExportList
          items={exports}
          page={page}
          setPage={setPage}
          limit={limit}
          total={total}
          isLoading={isFetching}
        />

        <ExportClipForm
          onExport={onExport}
          isLoading={isLoading}
          clipsCount={clips.length || 0}
        />
      </div>
    </Modal>
  );
};
