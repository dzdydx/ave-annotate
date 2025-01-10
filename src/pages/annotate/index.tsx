import React, { useRef, useState, useEffect } from "react";
import {
  Typography,
  Form,
  InputNumber,
  Button,
  Table,
  Card,
  message,
  Descriptions,
  Space,
  Radio,
  Progress,
  Row,
  Col,
} from "antd";
import { history } from "umi";
import dayjs from "dayjs";
import ReactPlayer from "react-player";
import {
  getVideoInfo,
  getAnnotations,
  postAnnotation,
  getProgress,
} from "@/services/api";
import config from "@/global";
import { Annotation } from "@/services/typings";
import WavDisplay from "./components/WavDisplay";

const { Title, Paragraph } = Typography;

const AnnotatePage: React.FC = () => {
  const [form] = Form.useForm();
  const videoRef = useRef<ReactPlayer>(null);

  const [annotatorName, setAnnotatorName] = useState("");
  const [completedSamples, setCompletedSamples] = useState(0);
  const [totalSamples, setTotalSamples] = useState(0);
  const [myAnnotationCount, setMyAnnotationCount] = useState(0);

  const [videoID, setVideoID] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [videoTag, setVideoTag] = useState("");
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const [eventBoundary, setEventBoundary] = useState<number[]>([0, 3]);
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
      title: "是否有背景音乐",
      dataIndex: "haveBGM",
      key: "haveBGM",
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
      setMyAnnotationCount(userInfo.data.myAnnotationCount);

      const videoInfo = await getVideoInfo();
      setVideoID(videoInfo.data.videoID);
      setVideoURL(videoInfo.data.videoURL);
      setVideoTag(videoInfo.data.category);

      const annotationInfo = await getAnnotations(videoInfo.data.videoID);
      setAnnotations(
        annotationInfo.data.data.map((item) => {
          return {
            id: item.id,
            annotator: item.annotator,
            startTime: item.startTime,
            endTime: item.endTime,
            audioIrrelevant: item.audioIrrelevant == 1 ? "❌ 无关" : "✅ 有关",
            haveBGM: item.haveBGM == 1 ? "✅ 有" : "❌ 无",
            annotateTime: dayjs(item.annotateTime).format(
              "YYYY-MM-DD HH:mm:ss"
            ),
          };
        })
      );
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
    if (videoRef.current) {
      setVideoElement(videoRef.current.getInternalPlayer() as HTMLVideoElement);
    }
  }, [videoURL]);

  useEffect(() => {
    form.setFieldsValue({
      startTime: eventBoundary[0],
      endTime: eventBoundary[1],
    });
  }, [eventBoundary]);

  const handleFormChange = (changedValues: any) => {
    const { startTime, endTime } = changedValues;
    if (startTime !== undefined || endTime !== undefined) {
      setEventBoundary([
        startTime ?? eventBoundary[0],
        endTime ?? eventBoundary[1],
      ]);
    }
  };

  const onFinish = (values: any) => {
    const {
      startTime,
      endTime,
      audioIrrelevant = false,
      haveBGM = false,
      fileInvalid = false,
    } = values;
    postAnnotation({
      videoID,
      startTime,
      endTime,
      audioIrrelevant,
      haveBGM,
      fileInvalid,
    }).then((res) => {
      if (res.status === 201) {
        message.success("标注成功");
        setCompletedSamples(completedSamples + 1);
        setMyAnnotationCount(myAnnotationCount + 1);

        setVideoElement(undefined);

        // 获取下一个视频的信息
        getVideoInfo().then((res) => {
          setVideoID(res.data.videoID);
          setVideoURL(res.data.videoURL);
          setVideoTag(res.data.category);
        });
      } else {
        message.error("标注失败");
      }

      form.resetFields();
      setIsAudioIrrelevant(false);
    });
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
          height: "calc(100vh - 64px - 25px)", // 64px is the height of the Footer
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Row
          wrap={false}
          style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", height: "100%" }}
          gutter={8}
        >
          <Col span={8}>
            <ReactPlayer
              ref={videoRef}
              controls
              url={`${config.baseURL}${videoURL}`} // ! delete when deploying
              //url={videoURL}
              height="100%"
              width="100%"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
              }}
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
          </Col>
          <Col
            span={16}
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Card
              title={`${annotatorName}，你好！你完成了${myAnnotationCount}个标注`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
              styles={{
                body: {
                  flex: 1,
                  height: "100%",
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
                      <Button onClick={() => history.push("/all")}>
                        查看/修改标注
                      </Button>
                      <Button
                        type="primary"
                        danger
                        onClick={() => {
                          onFinish({
                            startTime: 0,
                            endTime: duration,
                            audioIrrelevant: true,
                            fileInvalid: true,
                          });
                        }}
                      >
                        视频文件无效
                      </Button>
                    </Space>
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
                  marginTop: "20px",
                }}
              >
                {videoRef.current && videoElement && duration > 0 && (
                  <WavDisplay
                    videoRef={videoElement}
                    eventBoundary={eventBoundary}
                    setEventBoundary={setEventBoundary}
                  />
                )}
              </div>
              <div>
                <Title level={5}>标注事件</Title>
                <Form
                  form={form}
                  name="annotation"
                  layout="inline"
                  onFinish={onFinish}
                  onValuesChange={handleFormChange}
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
                    <InputNumber min={0} max={duration} precision={2} />
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
                    <InputNumber min={0} max={duration} precision={2} />
                  </Form.Item>
                  <Form.Item
                    name="audioIrrelevant"
                    label="音频是否与事件相关"
                    tooltip="所选事件范围内的音频不是由事件产生时选择无关"
                    required
                  >
                    <Radio.Group>
                      <Radio value={false}>相关</Radio>
                      <Radio value={true}>无关</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    name="haveBGM"
                    label="事件区域是否有背景音乐"
                    tooltip="仅当音乐与事件本身无关时选择是"
                    required
                  >
                    <Radio.Group>
                      <Radio value={true}>是</Radio>
                      <Radio value={false}>否</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      提交
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              <div
                style={{
                  flexGrow: 1,
                }}
              >
                <Title level={5}>标注历史</Title>
                <Table
                  dataSource={annotations}
                  columns={columns}
                  style={{ height: "100%", marginTop: "20px", marginBottom: 0 }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AnnotatePage;
