import React from "react";

/**
 *
 * @param dependency such as '@emurgo/cardano-serialization-lib-browser'
 */
export default function useWASM(dependency: string): {
  isLoading: boolean;
  error?: any;
  wasm?: any;
} {
  const [isLoading, setIsLoading] = React.useState<any>(true);
  const [wasm, setWasm] = React.useState<any | undefined>(undefined);
  const [error, setError] = React.useState<any | undefined>(undefined);

  React.useEffect(() => {
    async function start() {
      try {
        console.log("loading!");
        const cardanoWasm = await import(dependency);
        console.log("success");
        setWasm(cardanoWasm);
      } catch (error: any) {
        console.log(error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }
    start();
  }, []);

  return {
    isLoading: isLoading,
    wasm: wasm,
    error: error,
  };
}
