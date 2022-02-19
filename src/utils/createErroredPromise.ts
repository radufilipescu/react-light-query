export function createErroredPromise<T>(rejectReason?: any, timeout?: number): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(rejectReason);
    }, timeout);
  });
} 