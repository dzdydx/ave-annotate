import axios from "axios";
import { Annotation } from "./typings";
import config from "@/global";
import { message } from "antd";

// 创建一个带 JWT 的 axios 实例
const JWTAuthInstance = axios.create({
  baseURL: config.baseURL,
});

// 创建一个不带 JWT 的 axios 实例
const noAuthInstance = axios.create({
  baseURL: config.baseURL,
});

// 请求拦截器，用于在每个请求中添加 JWT token
JWTAuthInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，用于统一处理 Unauthorized 错误
JWTAuthInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");
      message.error("登录已过期，请重新登录");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export async function login(username: string, password: string) {
  return noAuthInstance.post<{
    token: string;
    error?: string;
  }>("/api/login", {
    username,
    password,
  });
}

export async function register(username: string, password: string) {
  return noAuthInstance.post<{
    id: number;
    username: string;
    error?: string;
  }>("/api/register", {
    username,
    password,
  });
}

export async function getProgress() {
  return JWTAuthInstance.get<{
    id: number;
    username: string;
    totalSamples: number;
    completedSamples: number;
  }>("/api/progress");
}

export async function getVideoInfo(videoID?: string) {
  return JWTAuthInstance.get<{
    videoID: string;
    videoURL: string;
    category: string;
  }>("/api/videos", {
    params: {
      videoID,
    },
  });
}

export async function getAnnotations(videoID: string) {
  return JWTAuthInstance.get("/api/annotations", {
    params: {
      videoID,
    },
  });
}

export async function getAllAnnotations(
  page: number,
  limit: number
): Promise<{
  data: Annotation[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const response = await JWTAuthInstance.get("/api/all-annotations", {
    params: { page, limit },
  });
  return response.data;
}

export async function postAnnotation(data: Annotation) {
  return JWTAuthInstance.post<Annotation>("/api/annotations", data);
}

export async function editAnnotation(data: Annotation) {
  return JWTAuthInstance.put<Annotation>("/api/annotations", data);
}

export async function deleteAnnotation(id: number) {
  return JWTAuthInstance.delete(`/api/annotations/${id}`);
}
