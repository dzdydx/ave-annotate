import React, { useState, useEffect } from "react";
import { Typography, Form, Input, Button, message, Modal } from "antd";
import { history } from "umi";
import { login, register } from "@/services/api";

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      history.push("/annotate");
    }
  }, []);

  const onFinish = async (values: { name: string; password: string }) => {
    try {
      const response = await login(values.name, values.password);
      const { token } = response.data;
      localStorage.setItem('token', token);
      history.push("/annotate");
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  const handleRegister = async (values: { name: string; password: string }) => {
    try {
      await register(values.name, values.password);
      message.success('注册成功，请登录');
      setIsModalVisible(false);
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        message.error('用户名已存在，请选择其他用户名');
      } else {
        message.error('注册失败，请稍后再试');
      }
    }
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
      <Paragraph>初次登录请记住用户名和密码，7天内登录有效</Paragraph>
      <Form layout="inline" onFinish={onFinish}>
        <Form.Item name="name" label="User name">
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password">
          <Input type="password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
        <Button type="text" onClick={() => setIsModalVisible(true)}>注册</Button>
      </Form>

      <Modal
        width={400}
        title="注册"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item name="name" label="User name" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input type="password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              注册
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HomePage;
