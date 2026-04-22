type AxiosLikeError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function getApiErrorMessage(err: unknown, fallback: string): string {
  return (err as AxiosLikeError)?.response?.data?.message ?? fallback;
}
