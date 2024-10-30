import { Outlet } from "umi";
import "./index.less";
import { Layout, Progress } from "antd";

const { Content, Footer } = Layout;

export default function BasicLayout() {
  return (
    <div>
      <Progress
        type="line"
        percent={0}
        format={(percent) => `${percent} / 97260`}
        percentPosition={{ align: "center", type: "inner" }}
        size={["100%", 25]}
      />
      <Layout style={{ height: "calc(100vh - 25px)" }}>
        <Content>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          dzdydx ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </div>
  );
}
