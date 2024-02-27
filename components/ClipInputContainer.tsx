import { Space } from "antd";
import { ReactNode } from "react";

export const ClipInputContainer = ({ children }: { children: ReactNode }) => (
  <Space style={{ marginBottom: 25 }}>{children}</Space>
);
