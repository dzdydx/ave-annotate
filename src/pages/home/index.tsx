import React from "react";
import { Typography, Form, Input, Button } from "antd";
import { history } from "umi";

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const onFinish = (values: { name: string }) => {
    localStorage.setItem('annotatorName', values.name);
    history.push("/annotate");
  };

  return (
    <div
      style={{
        height: "100%",
        padding: "48px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Title level={1}>Annotating AVE-PM</Title>
      <Paragraph>Please enter the ID of current annotator:</Paragraph>
      <Form layout="inline" onFinish={onFinish}>
        <Form.Item name="name">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HomePage;
