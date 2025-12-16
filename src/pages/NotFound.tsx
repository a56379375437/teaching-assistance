import { Result, Button, Space } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { mainkey } from "../types";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      icon={<SmileOutlined style={{ fontSize: 100, color: "#1677ff" }} spin />}
      extra={
        <Space size={16}>
          <Button type="primary" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
          <Button onClick={() => navigate(mainkey)}>回到首页</Button>
        </Space>
      }
      style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}
    />
  );
}
