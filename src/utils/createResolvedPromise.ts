export function createResolvedPromise<T>(value: T, timeout?: number): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, timeout);
  });
} 