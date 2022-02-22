import { useCallback, useEffect, useMemo, useState } from "react";

export class QueryState<TError = Error, TData = unknown> {
  public readonly isExecuting: boolean;

  public readonly data?: TData;
  getDefinedData(): TData {
    if (this.data === undefined) {
      throw new Error(`There is no data available`);
    }
    return this.data;
  }

  public readonly error?: TError;

  public readonly startRefresh: () => void;

  constructor(
    isExecuting: boolean, 
    data: TData | undefined, 
    error: TError | undefined,
    startRefresh: () => void,
  ) {
    this.isExecuting = isExecuting;
    this.data = data;
    this.error = error;
    this.startRefresh = startRefresh;
  }
}

export interface IQueryOptions<TError = Error, TData = unknown> {
  readonly onSuccess?: (result: TData) => void;
  readonly onError?: (error: TError) => void;
  readonly clearPreviousDataOnError?: boolean;
}

export type AsyncQueryFunc<TData = unknown, TParameters extends any[] = []> = (() => Promise<TData>) | ((...parameters: TParameters) => Promise<TData>);

export function useQuery<TError = Error, TData = unknown, TParameters extends any[] = [] /*TODO | { [paramName: string]: any } */>(
  asyncFn: AsyncQueryFunc<TData, TParameters>, 
  parameters: TParameters,
  options: IQueryOptions<TError, TData> = { }
): QueryState<TError, TData> {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<TError | undefined>(undefined);
  const [data, setData] = useState<TData | undefined>(undefined);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const startRefresh = useCallback(() => {
    if (refreshCount > Number.MAX_SAFE_INTEGER - 1) {
      setRefreshCount(0);
    } else {
      setRefreshCount(refreshCount + 1);
    }
  }, [refreshCount]);
  const queryResult = useMemo<QueryState<TError, TData>>(() => {
    return new QueryState(isExecuting, data, error, startRefresh);
  }, [isExecuting, data, error, startRefresh]);
  useEffect(() => {
      const onSuccess = (newData: TData) => {
        if (options.onSuccess) {
          options.onSuccess(newData);
        } else {
          setData(newData);
        }
        setError(undefined);
      }
      const onError = (newError: TError) => {
        if (options.onError) {
          options.onError(newError);
        } else {
          setError(newError);
        }
        if (options.clearPreviousDataOnError) {
          setData(undefined);
        }
      }
      let isSubscribed = true;
      const execute = async () => {
        setIsExecuting(true);
        try {
          const result = parameters
            ? await asyncFn(...parameters)
            : await asyncFn();
          if (isSubscribed) {
            onSuccess(result);
          }
        } catch (err) {
          if (isSubscribed) {
            onError(err as TError);
          }
        }
        setIsExecuting(false);
      };
      execute();
      return () => {
        isSubscribed = false;
      }
    }, 
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshCount, ...parameters] /* [onSuccess, onError, asyncFn, refreshCount, ...parameters] */
    // rerender should not be triggered whenever 'onSuccess', 'onError' or 'asyncFn' param reference changes, 
    // but also the user must not be forced to take care of it by using useCallback
  ); 
  return queryResult;
}