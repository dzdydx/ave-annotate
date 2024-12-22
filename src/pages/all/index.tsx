import React, { useEffect, useState } from "react";
import { Card, Table, TableProps } from "antd";
import { getAllAnnotations } from "@/services/api";
import { Annotation } from "@/services/typings";
import dayjs from "dayjs";

const AllAnnotationsPage: React.FC = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
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

  const columns: TableProps<Annotation>['columns'] = [
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
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  return (
    <Card title="所有标注记录">
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
    </Card>
  );
};

export default AllAnnotationsPage;
