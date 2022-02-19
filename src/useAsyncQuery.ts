import { useCallback, useEffect, useState } from "react";

export function useAsyncQuery<TResult, TParameters extends any[] /*TODO | { [paramName: string]: any } */, TError = Error>(
  asyncQuery: (() => Promise<TResult>) | ((...parameters: TParameters) => Promise<TResult>), 
  parameters: TParameters,
  callback: (result: TResult) => void, 
): [boolean, TError | null, (() => void)] {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<TError | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const refresh = useCallback(() => {
    if (refreshCount > 2) {
      setRefreshCount(0);
    } else {
      setRefreshCount(refreshCount + 1);
    }
  }, [refreshCount]);
  useEffect(() => {
      let isSubscribed = true;
      const execute = async () => {
        setIsExecuting(true);
        try {
          const result = parameters
            ? await asyncQuery(...parameters)
            : await asyncQuery();
          if (isSubscribed) {
            callback(result);
            setError(null);
            setIsExecuting(false);
          }
        } catch (err) {
          if (isSubscribed) {
            setError(err as any);
            setIsExecuting(false);
          }
        }
      };
      execute();
      return () => {
        isSubscribed = false;
      }
    }, 
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshCount, ...parameters] /* [callback, asyncQuery, refreshCount, ...parameters] */
    // rerender should not be triggered whenever 'callback' or 'asyncQuery' param reference changes, 
    // but also the user must not be forced to take care of it by using useCallback
  ); 
  return [isExecuting, error, refresh];
}