export interface Annotation {
  id?: number;
  startTime: string;
  endTime: string;
  audioIrrelevant: boolean;
  annotator: string;
  annotateTime?: string;
}