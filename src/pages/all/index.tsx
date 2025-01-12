import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Space,
  Table,
  TableProps,
} from "antd";
import {
  getAllAnnotations,
  editAnnotation,
  deleteAnnotation,
} from "@/services/api";
import { Annotation } from "@/services/typings";
import dayjs from "dayjs";
import { history } from "umi";

const AllAnnotationsPage: React.FC = () => {
  const [form] = Form.useForm();

  const [annotationID, setAnnotationID] = useState<number>();
  const [annotator, setAnnotator] = useState<string>();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnotations(page, pageSize);
  }, [page, pageSize]);

  const fetchAnnotations = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await getAllAnnotations(page, limit);
      setAnnotations(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch annotations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (record: Annotation) => {
    if (record.id !== undefined) {
      deleteAnnotation(record.id)
        .then(() => {
          message.success("删除标注成功");
          fetchAnnotations(page, pageSize);
        })
        .catch((error) => {
          message.error(`删除标注失败: ${error}`);
        });
    }
  };

  const columns: TableProps<Annotation>["columns"] = [
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
      render: (text) => (text ? "否" : "是"),
    },
    {
      title: "是否有背景音乐",
      dataIndex: "haveBGM",
      key: "haveBGM",
      render: (text) => (text ? "是" : "否"),
    },
    {
      title: "标注时间",
      dataIndex: "annotateTime",
      key: "annotateTime",
      render: (text) => dayjs(Number(text)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "操作",
      key: "action",
      render: (text, record) => (
        <Space size="large">
          <a
            onClick={() => {
              setAnnotationID(record.id);
              setAnnotator(record.annotator);
              setIsModalVisible(true);
              form.setFieldsValue({
                id: record.id,
                startTime: record.startTime,
                endTime: record.endTime,
                audioIrrelevant: record.audioIrrelevant ? true : false,
                haveBGM: record.haveBGM ? true : false,
              });
            }}
          >
            修改
          </a>
          <Popconfirm
            title="删除标注"
            description="确定要删除这条标注吗？"
            onConfirm={() => handleDelete(record)}
          >
            <a style={{ color: "red" }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="所有标注记录"
      extra={<Button onClick={() => history.push("/annotate")}>返回</Button>}
    >
      <Table
        dataSource={annotations}
        columns={columns}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        loading={loading}
      />
      <Modal
        title="修改标注"
        open={isModalVisible}
        okText="提交"
        cancelText="取消"
        onCancel={() => setIsModalVisible(false)}
        onOk={() => {
          form.submit();
          setIsModalVisible(false);
        }}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
          onFinish={async (values) => {
            const res = await editAnnotation(values);
            if (res.status === 200) {
              message.success("修改标注成功");
              fetchAnnotations(page, pageSize);
              setIsModalVisible(false);
            } else {
              message.error(`修改标注失败: ${res.statusText}`);
            }
          }}
        >
          <Form.Item label="id" name="id">
            <span>{annotationID}</span>
          </Form.Item>
          <Form.Item label="标注人">
            <span>{annotator}</span>
          </Form.Item>
          <Form.Item label="起始时间" name="startTime">
            <InputNumber min={0} precision={2} />
          </Form.Item>
          <Form.Item label="结束时间" name="endTime">
            <InputNumber min={0} precision={2} />
          </Form.Item>
          <Form.Item label="音频是否相关" name="audioIrrelevant">
            <Radio.Group>
              <Radio value={false}>相关</Radio>
              <Radio value={true}>无关</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="是否有背景音乐" name="haveBGM">
            <Radio.Group>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AllAnnotationsPage;
