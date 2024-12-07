import axios from "axios";
import { Annotation } from "./typings";
import config from "@/global"

export async function login(username: string, password: string) {
  return axios.post(`${config.baseURL}/api/login`, {
    username,
    password,
  });
}

export async function getVideoInfo(videoID?: string, userID?: number) {
  return axios.get(`${config.baseURL}/api/videos`, {
    params: {
      videoID,
      userID,
    },
  });
}

export async function getAnnotations(videoID: string): Promise<Annotation[]> {
  return axios.get(`${config.baseURL}/api/annotations`, {
    params: {
      videoID,
    },
  });
}

export async function postAnnotation(data: Annotation) {
  return axios.post(`${config.baseURL}/api/annotations`, data);
}