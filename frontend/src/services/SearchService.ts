import { apiClient } from "../api/client";
 
export type Force = "policia_nacional" | "guardia_civil" | "";
export type SortOption = "relevance" | "name_asc" | "name_desc";
 
export interface TopicItem {
  number: number;
  title: string;
  force: Force;
  block?: string;
}
 
export interface DocumentHit {
  id: string;
  score: number;
  name: string;
  forces: Force[];
  topics: Array<{ force: Force; number: number; title: string }>;
  filePath?: string;
  highlights: {
    text?: string[];
    name?: string[];
    topicTitles?: string[];
  };
}
 
export interface SearchResponse {
  totalResultados: number;
  paginaActual: number;
  totalPaginas: number;
  documentos: DocumentHit[];
}
 
export interface SearchParams {
  q?: string;
  force?: Force;
  topic?: number | "";
  page?: number;
  limit?: number;
  sort?: SortOption;
}
 
export async function searchDocuments(params: SearchParams): Promise<SearchResponse> {
  const qs = new URLSearchParams();
  if (params.q)     qs.set("q", params.q);
  if (params.force) qs.set("force", params.force);
  if (params.topic) qs.set("topic", String(params.topic));
  if (params.page)  qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.sort)  qs.set("sort", params.sort);
 
  return apiClient.get<SearchResponse>(`/search?${qs}`);
}
 
export async function fetchTopics(force?: Force): Promise<TopicItem[]> {
  const qs = force ? `?force=${force}` : "";
  const data = await apiClient.get<{ topics: TopicItem[] }>(`/search/topics${qs}`);
  return data.topics;
}