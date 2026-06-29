import { useEffect, useState, useCallback } from "react";

// Makes a fetch request and throws a readable error if the response is not ok
async function sendHttpReq(url, config) {
  const response = await fetch(url, config);
  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Something went wrong!");
  }
  return resData;
}

// Custom hook for making HTTP requests
// Automatically fires a GET request on mount, and exposes sendRequest for manual calls
export default function useHttp(url, config, initialData) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  // Reset data back to the initial value
  function clearData() {
    setData(initialData);
  }

  const sendRequest = useCallback(
    async function sendRequest(data) {
      setIsLoading(true);
      try {
        const resData = await sendHttpReq(url, { ...config, body: data });
        setData(resData);
      } catch (error) {
        setError(error.message || "Something went wrong!");
      }
      setIsLoading(false);
    },
    [url, config]
  );

  // Automatically send a GET request when the component mounts
  useEffect(() => {
    if ((config && (config.method === "GET" || !config.method)) || !config) {
      sendRequest();
    }
  }, [sendRequest, config]);

  return {
    data,
    isLoading,
    error,
    sendRequest,
    clearData,
  };
}