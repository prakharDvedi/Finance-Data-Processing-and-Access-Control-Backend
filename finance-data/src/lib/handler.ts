type ApiError = {
  status: number;
  message: string;
  code?: string;
};

export function handleRoute(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      const status = err?.status ?? 500;
      const message =
        err?.message ?? "Internal server error";
      const code = err?.code;

      const body = { error: { message, code } };
      return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      });
    }
  };
}
