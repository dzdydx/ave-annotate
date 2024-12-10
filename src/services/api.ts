import axios from "axios";
import { Annotation } from "./typings";
import config from "@/global";

// 创建一个带 JWT 的 axios 实例
const instance = axios.create({
  baseURL: config.baseURL,
});

// 创建一个不带 JWT 的 axios 实例
const noAuthInstance = axios.create({
  baseURL: config.baseURL,
});

// 请求拦截器，用于在每个请求中添加 JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export async function login(username: string, password: string) {
  return noAuthInstance.post('/api/login', {
    username,
    password,
  });
}

export async function register(username: string, password: string) {
  return noAuthInstance.post('/api/register', {
    username,
    password,
  });
}

export async function getVideoInfo(videoID?: string, userID?: number) {
  return instance.get('/api/videos', {
    params: {
      videoID,
      userID,
    },
  });
}

export async function getAnnotations(videoID: string): Promise<Annotation[]> {
  return instance.get('/api/annotations', {
    params: {
      videoID,
    },
  });
}

export async function postAnnotation(data: Annotation) {
  return instance.post('/api/annotations', data);
}