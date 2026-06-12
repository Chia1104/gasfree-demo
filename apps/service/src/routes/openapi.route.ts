import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { Hono } from "hono";

import { router } from "@repo/api/orpc/router";

const api = new Hono<HonoContext>();

const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

api.use("/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/api/v1/rest",
    context: {
      headers: c.req.raw.headers,
      clientIP: c.var.clientIP,
    },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

export default api;
