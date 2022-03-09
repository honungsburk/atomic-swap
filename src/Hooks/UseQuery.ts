import React from "react";
import { useLocation } from "react-router-dom";

/**
 *
 * @returns a way to search for query params in the URL
 */
function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default useQuery;
