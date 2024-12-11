export interface Annotation {
  id?: number;
  videoID?: string;
  startTime: string;
  endTime: string;
  audioIrrelevant: boolean;
  annotator?: string;
  annotateTime?: string;
}