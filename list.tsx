import { useCallback, useEffect, useState } from "react";
import { Divider, Layout, Space, Typography, message, theme } from "antd";
import { FolderFilled, CloseCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import Button from "@/global/components/button";
import {
  useDeleteSummarizedMediaMutation,
  useLazyGetSummarizedMediasQuery,
} from "./services";
import { humanizeStatus } from "@/global/utility";
import { STATUS_COLOR_MAP, getConstant } from "@/global/constants";
import PaginatedList from "@/global/components/paginatedList";
import { TSummarizedMedia, TSummarizedMediaPayload } from "./types";
import moment from "moment";

const { Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const INITIAL_PAGE = 1;
export const ClipMedias = () => {
  const [getSummarizedMediasApi, { data: payload, isLoading, isFetching }] =
    useLazyGetSummarizedMediasQuery();
  const [deleteSummarizedMedia, { isLoading: isDeleting }] =
    useDeleteSummarizedMediaMutation();

  const [page, setPage] = useState(INITIAL_PAGE);
  const [pollInterValId, setPollInterValId] = useState<
    NodeJS.Timer | number | null
  >(null);
  const [isPolling, setPolling] = useState(false);
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const {
    data = [],
    total,
    limit = 16,
  }: TSummarizedMediaPayload = payload || {};

  const getSummarizedMedias = useCallback<(isPolling?: boolean) => void>(
    (isPolling?: boolean) => {
      isPolling && setPolling(true);
      getSummarizedMediasApi({
        limit,
        page,
        sortKey: "createdAt",
        sortOrder: "desc",
      }).then(() => {
        isPolling && setPolling(false);
      });
    },
    [limit, page, getSummarizedMediasApi],
  );

  // handle polling for inprogress videos
  useEffect(() => {
    if (!data) return;
    const inProgressVideos = data.filter((video) => {
      return video.status === "InProgress";
    });

    if (inProgressVideos?.length > 0) {
      const intervalId = setInterval(() => {
        getSummarizedMedias(true);
      }, getConstant("pollingInterval"));

      setPollInterValId(intervalId);
      return () => {
        clearInterval(intervalId);
      };
    }

    return () => {
      clearInterval(pollInterValId as number);
      setPollInterValId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, getSummarizedMedias]);

  useEffect(() => {
    getSummarizedMedias();
  }, [getSummarizedMedias]);

  const handleDelete = (media: TSummarizedMedia) => {
    deleteSummarizedMedia(media._id).then((res: any) => {
      if (res?.data?.success) {
        message.success("Media Deleted Successfully.");
      }
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#111315",
          alignItems: "center",
          paddingRight: 64,
          borderBottom: "1px solid #222526",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 300 }}>Projects</Text>
      </Header>
      <Content style={{ padding: "32px 64px", background: "#0f1112" }}>
        <PaginatedList
          dataSource={data}
          loading={isLoading || (isFetching && !isPolling)}
          total={total}
          limit={limit}
          page={page}
          setPage={setPage}
          style={{ overflow: "auto" }}
          pagination={{
            size: "small",
            align: "center",
          }}
          renderItem={(media: TSummarizedMedia) => {
            const isCompleted = media.status === "Completed";
            return (
              <Space
                direction="vertical"
                key={media._id}
                style={{
                  backgroundColor: "#26282C",
                  marginRight: 30,
                  marginBottom: 30,
                  width: 250,
                  border: `1px solid ${colorBgContainer}`,
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <Space
                  direction="horizontal"
                  align="start"
                  style={{ position: "relative", width: "100%" }}
                >
                  <FolderFilled
                    style={{ color: "rgba(255, 255, 255, 0.1)", fontSize: 50 }}
                  />
                  <div>
                    <Paragraph
                      strong
                      style={{
                        fontWeight: 300,
                        marginBottom: 0,
                      }}
                      ellipsis={{
                        rows: 2,
                        tooltip: media.name,
                      }}
                    >
                      {media.name}
                    </Paragraph>
                    {media.status === "Completed" && (
                      <Text>{media.timestamps?.length} clips</Text>
                    )}
                  </div>
                  {!isCompleted && (
                    <CloseCircleOutlined
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 10,
                        color: "red",
                      }}
                      onClick={() => handleDelete(media)}
                      disabled={isDeleting}
                    />
                  )}
                </Space>
                <Divider style={{ margin: 0 }} />
                <Space
                  direction="horizontal"
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    minHeight: 40,
                  }}
                >
                  <div>
                    <Text
                      style={{
                        color: STATUS_COLOR_MAP[media.status],
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {humanizeStatus(media.status).toUpperCase()}
                    </Text>
                    <br />
                    <Text style={{ fontSize: 10 }}>
                      {moment.utc(media.createdAt).fromNow()}
                    </Text>
                  </div>
                  {isCompleted && (
                    <Button
                      type="default"
                      onClick={() => {
                        router.push(`/clips/edit/${media._id}`);
                      }}
                    >
                      View
                    </Button>
                  )}
                </Space>
              </Space>
            );
          }}
        />
      </Content>
    </Layout>
  );
};
