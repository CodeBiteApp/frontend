import api from "@/api/axios";
import { BookmarkListResponse, BookmarkResponse } from "@/types/bookmark";

export async function fetchBookmarks(subjectId?: number): Promise<BookmarkListResponse[]> {
  const res = await api.get<BookmarkListResponse[]>("/api/bookmarks", {
    params: subjectId !== undefined ? { subjectId } : {},
  });
  return res.data;
}

export async function addBookmark(conceptId: number): Promise<BookmarkResponse> {
  const res = await api.post<BookmarkResponse>(`/api/bookmarks/${conceptId}`);
  return res.data;
}

export async function removeBookmark(conceptId: number): Promise<BookmarkResponse> {
  const res = await api.delete<BookmarkResponse>(`/api/bookmarks/${conceptId}`);
  return res.data;
}
