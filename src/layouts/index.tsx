import { Outlet } from "umi";
import "./index.less";
import { Layout } from "antd";

const { Content, Footer } = Layout;

export default function BasicLayout() {
  return (
    <div>
      <Layout style={{ height: "100vh" }}>
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
