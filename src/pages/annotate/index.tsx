import React, { useRef, useState, useEffect } from "react";
import {
  Typography,
  Form,
  InputNumber,
  Button,
  Splitter,
  Table,
  Card,
  message,
  Descriptions,
  Space,
  Checkbox,
  Skeleton,
  Progress,
} from "antd";
import { history } from "umi";
import ReactPlayer from "react-player";
import {
  getVideoInfo,
  getAnnotations,
  postAnnotation,
  getProgress,
} from "@/services/api";
import config from "@/global";
import { Annotation } from "@/services/typings";

const { Title, Paragraph } = Typography;

const AnnotatePage: React.FC = () => {
  const [form] = Form.useForm();
  const videoRef = useRef<ReactPlayer>(null);

  const [annotatorName, setAnnotatorName] = useState("");
  const [completedSamples, setCompletedSamples] = useState(0);
  const [totalSamples, setTotalSamples] = useState(0);

  const [videoID, setVideoID] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [videoTag, setVideoTag] = useState("");

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const [startTime, setStartTime] = useState(1);
  const [endTime, setEndTime] = useState(1);
  const [isAudioIrrelevant, setIsAudioIrrelevant] = useState(false);

  const columns = [
    {
      title: "序号",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "标注人",
      dataIndex: "annotator",
      key: "annotator",
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
    {
      title: "音频是否相关",
      dataIndex: "audioIrrelevant",
      key: "audioIrrelevant",
    },
    {
      title: "标注时间",
      dataIndex: "annotateTime",
      key: "annotateTime",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("请先登录");
      history.push("/");
    }

    const init = async () => {
      const userInfo = await getProgress();
      setAnnotatorName(userInfo.data.username);
      setCompletedSamples(userInfo.data.completedSamples);
      setTotalSamples(userInfo.data.totalSamples);

      const videoInfo = await getVideoInfo();
      setVideoID(videoInfo.data.videoID);
      setVideoURL(videoInfo.data.videoURL);
      setVideoTag(videoInfo.data.category);

      const annotationInfo = await getAnnotations(videoInfo.data.videoID);
      setAnnotations(annotationInfo.data.annotations);
    };

    init();
  }, []);

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
      form.resetFields();
      form.setFieldsValue({ startTime: 1, endTime: duration - 1 });
    }
  }, [duration]);

  //

  const onFinish = (values: any) => {
    const { startTime, endTime, audioIrrelevant } = values;
    postAnnotation({
      videoID,
      startTime,
      endTime,
      audioIrrelevant,
    }).then((res) => {
      if (res.status === 201) {
        message.success("标注成功");
        setCompletedSamples(completedSamples + 1);
        
        // 获取下一个视频的信息
        getVideoInfo().then((res) => {
          setVideoID(res.data.videoID);
          setVideoURL(res.data.videoURL);
          setVideoTag(res.data.category);
        });
      } else {
        message.error("标注失败");
      }
    });
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
    <div>
      <Progress
        type="line"
        percent={(completedSamples / totalSamples) * 100}
        format={() => `${completedSamples}/${totalSamples}`}
        percentPosition={{ align: "center", type: "inner" }}
        size={["100%", 25]}
      />
      <div
        style={{
          padding: "48px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Splitter style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
          <Splitter.Panel
            defaultSize="40%"
            min="30%"
            max="70%"
            style={{ height: "100%", overflow: "hidden", maxHeight: "100%" }}
          >
            <ReactPlayer
              ref={videoRef}
              controls
              url={`http://localhost:3010${videoURL}`} // ! delete when deploying
              height="100%"
              style={{ display: "block", maxWidth: "100%", maxHeight: "100%" }}
              onDuration={(duration) => setDuration(duration)}
              config={{
                file: {
                  attributes: {
                    width: "100%",
                    height: "100%",
                  },
                },
              }}
            />
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
                    {
                      // TODO: add this button back
                      /* <Space size="large">
                    <Button icon={<RightOutlined />} onClick={() => {
                      history.push(`/annotate?videoID=${nextVideoID}`);
                    }}>下一个文件</Button>
                  </Space> */
                    }
                  </div>
                }
              >
                <Descriptions.Item label="样本ID">{videoID}</Descriptions.Item>
                <Descriptions.Item label="文件标签">
                  {videoTag}
                </Descriptions.Item>
                <Descriptions.Item label="时长">
                  {(currentTime ?? 0).toFixed(2)} / {(duration ?? 0).toFixed(2)}
                </Descriptions.Item>
              </Descriptions>
              <div
                style={{
                  position: "relative",
                  width: "80%",
                  marginTop: "20px",
                }}
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
                  src="melspecs/v0d00fg10000cbmruq3c77u9rr5r3h30.png"
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
                  <Form.Item name="audioIrrelevant" valuePropName="checked">
                    <Checkbox
                      onChange={(e) => {
                        setIsAudioIrrelevant(e.target.checked);
                        form.setFieldsValue({
                          startTime: 0,
                          endTime: duration,
                        });
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
                  dataSource={annotations}
                  columns={columns}
                  style={{ width: "80%", marginTop: "20px", marginBottom: 0 }}
                />
              </div>
            </Card>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
};

export default AnnotatePage;
