import React from "react";

/**
 * Avoid executing an async function after a component has unmounted
 *
 * @param asyncFn - the async function to execute
 * @param onSuccess - what to do when your async function completed
 */
export function useAsync<A>(
  asyncFn: () => Promise<A>,
  onSuccess: (a: A) => void,
  deps?: any[]
) {
  React.useEffect(() => {
    let isActive = true;
    asyncFn().then((data) => {
      if (isActive) onSuccess(data);
    });
    return () => {
      isActive = false;
    };
  }, [asyncFn, onSuccess, ...(deps ?? [])]);
}
