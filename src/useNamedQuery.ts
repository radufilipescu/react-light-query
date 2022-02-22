import { useContext, useEffect, useState } from "react";
import { useQuery } from ".";
import { QueryContext } from "./QueryContextProvider";
import { AsyncQueryFunc, IQueryOptions, QueryState } from "./useQuery";

export function useNamedQuery<TError = Error, TData = unknown, TParameters extends any[] = []>(
  name: string,
  asyncFn: AsyncQueryFunc<TData, TParameters>, 
  parameters: TParameters,
  options: IQueryOptions<TError, TData> = { }
): QueryState<TError, TData>  {
  const [prevName] = useState<string>(name);
  if (prevName !== name) {
    throw new Error(`You are not allowed to change a query name`);
  }
  const queryState = useQuery<TError, TData, TParameters>(asyncFn, parameters, options);
  const ctx = useContext(QueryContext);
  useEffect(() => {
    if (ctx) {
      ctx.addOrReplaceNamedQueryState(name, queryState as any);
    }
  }, [name, ctx, queryState]);
  return queryState;
}