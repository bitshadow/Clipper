import { getQueryParams } from "@/global/utility/helperFunctions";
import { getData, getPayload, handleError } from "@/global/utility/response";
import { baseApi1b } from "@/services/api1b";

export const clipsAPI = baseApi1b
  .enhanceEndpoints({
    addTagTypes: ["ClipExports", "SummarizedMedias"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getS3SignedUrl: builder.query({
        query: (body) => {
          return {
            url: "clippify/media/upload/",
            method: "POST",
            body,
          };
        },
        transformResponse: getData,
        transformErrorResponse: handleError,
      }),
      summarizeMedia: builder.query({
        query: ({ ...body }) => {
          return {
            url: "clippify/summarize/",
            method: "POST",
            body,
          };
        },
        transformResponse: getData,
        transformErrorResponse: handleError,
      }),
      getSummarizedMedias: builder.query({
        query: (params = {}) => {
          const queryParams = getQueryParams(params);
          return {
            url: `clippify/summarize/?${queryParams}`,
            method: "GET",
          };
        },
        providesTags: ["SummarizedMedias"],
        transformResponse: getPayload,
        transformErrorResponse: handleError,
      }),
      getSummarizedMedia: builder.query({
        query: (mediaId) => {
          return {
            url: `clippify/summarize/${mediaId}/`,
            method: "GET",
          };
        },
        transformResponse: getData,
        transformErrorResponse: handleError,
      }),
      updateSummarizedMedia: builder.query({
        query: ({ mediaId, ...body }) => {
          return {
            url: `clippify/summarize/${mediaId}/`,
            method: "PATCH",
            body,
          };
        },
        transformErrorResponse: handleError,
      }),
      deleteSummarizedMedia: builder.mutation({
        query: (mediaId) => {
          return {
            url: `clippify/summarize/${mediaId}/`,
            method: "DELETE",
          };
        },
        invalidatesTags: ["SummarizedMedias"],
        transformErrorResponse: handleError,
      }),
      exportMedia: builder.mutation({
        query: ({ mediaId, ...body }) => {
          return {
            url: `/clippify/export/${mediaId}/`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["ClipExports"],
        transformResponse: getData,
        transformErrorResponse: handleError,
      }),
      getMediaExportsList: builder.query({
        query: ({ mediaId, ...params }) => {
          const queryParams = getQueryParams(params);
          return {
            url: `/clippify/export/${mediaId}/?${queryParams}`,
            method: "GET",
          };
        },
        providesTags: ["ClipExports"],
        transformResponse: getPayload,
        transformErrorResponse: handleError,
      }),
    }),
  });

export const {
  useLazySummarizeMediaQuery,
  useLazyGetS3SignedUrlQuery,
  useLazyGetSummarizedMediasQuery,
  useLazyGetSummarizedMediaQuery,
  useLazyGetMediaExportsListQuery,
  useLazyUpdateSummarizedMediaQuery,
  useDeleteSummarizedMediaMutation,
  useExportMediaMutation,
} = clipsAPI;
