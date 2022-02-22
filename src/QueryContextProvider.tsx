import React, { createContext } from 'react';
import { QueryState } from './useQuery';

export class QueryContextImpl {
  private _namedQueriesMap = new Map<string, QueryState>();
  addOrReplaceNamedQueryState(name: string, queryState: QueryState): void {
    this._namedQueriesMap.set(name, queryState);
  }

  startRefresh(nameOrNames: string | string[]): void {
    const names = Array.isArray(nameOrNames)
      ? nameOrNames
      : [nameOrNames];
    for (let name of names) {
      const foundQueryState = this._namedQueriesMap.get(name);
      if (!foundQueryState) {
        throw new Error(`No named query found for '${name}'`);
      }
      foundQueryState.startRefresh();
    }
  }
}

export const QueryContext = createContext<QueryContextImpl | undefined>(undefined);

export function QueryContextProvider(props: {
  readonly children: React.ReactNode
}) {
  return (
    <QueryContext.Provider value={new QueryContextImpl()} >
      {props.children}
    </QueryContext.Provider>
  );
}