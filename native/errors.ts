
export class HttpError extends Error {
  expose = false;
  status = 500;
}

export function throwError(staus: number, message: string): never {
  const error = new HttpError(message);
  error.status = staus;
  throw error;
}