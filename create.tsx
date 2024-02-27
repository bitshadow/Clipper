import { Button, Layout, Space, Typography, message } from "antd";
import { CreateSteps } from "./components/CreateClipSteps";
import { useEffect, useState } from "react";
import { TCreateClipPayload, TSummarizedMedia } from "./types";
import { useLazySummarizeMediaQuery } from "./services";
import { useRouter } from "next/router";

const { Header, Content } = Layout;
const { Paragraph } = Typography;

type TBody = TCreateClipPayload & { name: string };
export const CreateClips = () => {
  const [name, setName] = useState("First Project");
  const [payload, setPayload] = useState<TCreateClipPayload | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [summarizeMediaApi, { isLoading }] = useLazySummarizeMediaQuery();
  const router = useRouter();
  const handleGeneration = () => {
    if (!payload) return;

    const body: TBody = {
      objectId: payload.objectId,
      name: name,
      language: payload.language,
      model: payload.model || "v2",
      mediaType: payload.mediaType,
    };

    summarizeMediaApi(body)
      .then((res: any) => {
        if (res.data && (res.data as TSummarizedMedia)._id) {
          return router.push("/clips");
        }
        message.error("Error while processing file");
      })
      .catch((error) => {
        message.error("Error while processing file");
      });
  };

  useEffect(() => {
    if (!payload) {
      setIsValid(false);
    } else {
      const requiredKeys = ["objectId", "language", "mediaType"];
      setIsValid(!!(requiredKeys.every((k) => k in payload) && name));
    }
  }, [payload, name]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#111315",
          borderBottom: "1px solid #222526",
          paddingRight: 64,
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
            editable={{ onChange: setName }}
            style={{
              marginBottom: 0,
              fontSize: 18,
              fontWeight: 300,
              minWidth: 500,
            }}
          >
            {name}
          </Paragraph>
          <span>
            {
              <Button
                style={{ fontWeight: "bold", marginRight: 24 }}
                type="default"
                disabled={isLoading}
                onClick={() => setPayload(null)}
              >
                CANCEL
              </Button>
            }
            <Button
              disabled={isLoading || !isValid}
              style={{ fontWeight: "bold" }}
              loading={isLoading}
              onClick={handleGeneration}
              type="primary"
            >
              START
            </Button>
          </span>
        </Space>
      </Header>
      <Content style={{ padding: "32px 64px", background: "#0f1112" }}>
        <div style={{ pointerEvents: isLoading ? "none" : "auto" }}>
          <CreateSteps
            onChange={(payload) => setPayload(payload)}
            value={payload}
          />
        </div>
      </Content>
    </Layout>
  );
};
