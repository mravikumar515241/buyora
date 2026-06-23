/**
 * Backend returns { success: boolean, data: T }.
 * Axios response is { data: responseBody }, so responseBody.data is the payload.
 * Use this to consistently extract the payload and avoid data vs data.data bugs.
 */
export const extractApiData = (res) => res?.data?.data;

/**
 * For list/array responses where backend returns { success, data: [...] }
 */
export const extractApiList = (res) => {
  const data = extractApiData(res);
  return Array.isArray(data) ? data : [];
};

/**
 * For paginated responses where backend returns { success, data: Page<T> }
 * Spring Page has: content, totalPages, totalElements, number, size
 */
export const extractApiPage = (res) => {
  const data = extractApiData(res);
  return data ?? { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 };
};
