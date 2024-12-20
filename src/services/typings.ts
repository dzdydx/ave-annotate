export interface Annotation {
  id?: number;
  videoID?: string;
  startTime: string;
  endTime: string;
  audioIrrelevant: boolean;
  haveBGM: boolean;
  annotator?: string;
  annotateTime?: string;
  fileInvalid?: boolean;
}