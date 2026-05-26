export interface BookmarkResponse {
  conceptId: number;
  isMarked: boolean;
}

export interface BookmarkListResponse {
  conceptId: number;
  title: string;
  subjectName: string;
  hasChild: boolean;
}
