import React, { useRef, useState, useEffect } from "react";
import {
  Typography,
  Form,
  InputNumber,
  Button,
  Flex,
  Splitter,
  Table,
  Card,
  message,
  Descriptions,
  Space,
  Checkbox,
} from "antd";
import { history } from "umi";
import ReactPlayer from "react-player";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const AnnotatePage: React.FC = () => {
  const [form] = Form.useForm();
  const videoRef = useRef<ReactPlayer>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(1);
  const [endTime, setEndTime] = useState(1);
  const [isAudioIrrelevant, setIsAudioIrrelevant] = useState(false);

  const annotatorName = localStorage.getItem("annotatorName");
  if (!annotatorName) {
    message.error("请重新输入标注人ID");
    history.push("/");
  }

  const fileName = "v0d00fg10000cbmruq3c77u9rr5r3h30.mp4";
  const fileTag = "Playing Piano";

  const dataSource = [
    {
      key: "1",
      annotatorId: "123",
      eventType: "Event A",
      startTime: "00:10",
      endTime: "00:20",
    },
    {
      key: "2",
      annotatorId: "456",
      eventType: "Event B",
      startTime: "01:00",
      endTime: "01:10",
    },
  ];

  const columns = [
    {
      title: "标注人",
      dataIndex: "annotatorId",
      key: "annotatorId",
    },
    {
      title: "事件类别",
      dataIndex: "eventType",
      key: "eventType",
    },
    {
      title: "起始时间",
      dataIndex: "startTime",
      key: "startTime",
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      key: "endTime",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.getCurrentTime());
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      setEndTime(duration - 1);
      form.setFieldsValue({ startTime: 1, endTime: duration - 1 });
    }
  }, [duration]);

  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  const handleStartTimeChange = (value: number | null) => {
    if (value !== null && value < endTime) {
      setStartTime(value);
    }
  };

  const handleEndTimeChange = (value: number | null) => {
    if (value !== null && value > startTime) {
      setEndTime(value);
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    type: "start" | "end"
  ) => {
    e.dataTransfer.setData("type", type);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const type = e.dataTransfer.getData("type");
    const boundingRect = e.currentTarget.getBoundingClientRect();
    if (type === "start") {
      const relativeX = e.clientX - boundingRect.left;
      const newTime = parseFloat(
        ((relativeX / e.currentTarget.clientWidth) * duration).toFixed(2)
      );
      if (newTime >= endTime) {
        message.info("起始时间必须小于结束时间");
        setStartTime(endTime - 0.5);
        form.setFieldsValue({ startTime: endTime - 0.5 });
      } else {
        setStartTime(newTime);
        form.setFieldsValue({ startTime: newTime });
      }
    } else if (type === "end") {
      const relativeX = boundingRect.right - e.clientX;
      const newTime = parseFloat(
        ((1 - relativeX / e.currentTarget.clientWidth) * duration).toFixed(2)
      );
      if (newTime <= startTime) {
        message.info("结束时间必须大于起始时间");
        setEndTime(startTime + 0.5);
        form.setFieldsValue({ endTime: startTime + 0.5 });
      } else {
        setEndTime(newTime);
        form.setFieldsValue({ endTime: newTime });
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
      <Splitter
        style={{ height: "100%", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
      >
        <Splitter.Panel defaultSize="40%" min="30%" max="70%">
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <ReactPlayer
              ref={videoRef}
              controls
              url="/videos/v0d00fg10000cbmruq3c77u9rr5r3h30.mp4"
              width="100%"
              height="100%"
              style={{ objectFit: "cover" }}
              onDuration={(duration) => setDuration(duration)}
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <Card
            title={`${annotatorName}，你好！`}
            style={{
              height: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "16px",
            }}
            styles={{
              body: {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              },
            }}
          >
            <Descriptions
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Title level={5}>视频信息</Title>
                  <Space size="large">
                    <Button icon={<LeftOutlined />}>上一个文件</Button>
                    <Button icon={<RightOutlined />}>下一个文件</Button>
                  </Space>
                </div>
              }
            >
              <Descriptions.Item label="文件名">{fileName}</Descriptions.Item>
              <Descriptions.Item label="文件标签">{fileTag}</Descriptions.Item>
              <Descriptions.Item label="时长">
                {(currentTime ?? 0).toFixed(2)} / {(duration ?? 0).toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
            <div
              style={{ position: "relative", width: "80%", marginTop: "20px" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  top: 0,
                  left: "0",
                  width: `${(startTime / duration) * 100}%`,
                  height: "100%",
                  backgroundColor: "rgba(128, 128, 128, 0.5)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "45%",
                    right: 0,
                    width: "10px",
                    height: "10%",
                    backgroundColor: "yellowgreen",
                    cursor: "ew-resize",
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "start")}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  top: 0,
                  right: "0",
                  width: `${(1 - endTime / duration) * 100}%`,
                  height: "100%",
                  backgroundColor: "rgba(128, 128, 128, 0.5)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: 0,
                    width: "10px",
                    height: "10%",
                    backgroundColor: "yellowgreen",
                    cursor: "ew-resize",
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "end")}
                />
              </div>
              <img
                src="/melspecs/v0d00fg10000cbmruq3c77u9rr5r3h30.png"
                alt="Mel Spectrogram"
                style={{ width: "100%", height: "auto" }}
                draggable={false}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `calc(12px + ${(currentTime / duration) * 97.8}%)`,
                  width: "2px",
                  height: "90%",
                  backgroundColor: "red",
                }}
              />
            </div>
            <div>
              <Title level={5}>标注事件</Title>
              <Form
                form={form}
                name="annotation"
                layout="inline"
                onFinish={onFinish}
                style={{ width: "80%", marginTop: "20px" }}
              >
                <Form.Item
                  label="起始时间"
                  name="startTime"
                  rules={[
                    { required: true, message: "请输入起始时间!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || value < getFieldValue("endTime")) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("起始时间必须小于结束时间!")
                        );
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={duration}
                    precision={2}
                    onChange={handleStartTimeChange}
                    disabled={isAudioIrrelevant}
                  />
                </Form.Item>
                <Form.Item
                  label="结束时间"
                  name="endTime"
                  rules={[
                    { required: true, message: "请输入结束时间!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || value > getFieldValue("startTime")) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("结束时间必须大于起始时间!")
                        );
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={duration}
                    precision={2}
                    onChange={handleEndTimeChange}
                    disabled={isAudioIrrelevant}
                  />
                </Form.Item>
                <Form.Item
                  name="audioIrrelevant"
                  valuePropName="checked"
                >
                  <Checkbox
                  onChange={(e) => {
                    setIsAudioIrrelevant(e.target.checked);
                    form.setFieldsValue({ startTime: 0, endTime: duration });
                  }}
                  >
                  音频与类别无关
                  </Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <div>
              <Title level={5}>标注历史</Title>
              <Table
                dataSource={dataSource}
                columns={columns}
                style={{ width: "80%", marginTop: "20px", marginBottom: 0 }}
              />
            </div>
          </Card>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};

export default AnnotatePage;
