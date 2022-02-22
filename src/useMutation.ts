import { useState } from "react";

export function useMutation<TError = Error>(
  asyncFn: (() => Promise<void>),
): [boolean, TError | null, (() => void)] {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<TError | null>(null);
  const execute = async () => {
    setIsExecuting(true);
    try {
      await asyncFn();
      setError(null);
      setIsExecuting(false);
    } catch (err) {
      setError(err as any);
      setIsExecuting(false);
    }
  }
  return [isExecuting, error, execute];
}