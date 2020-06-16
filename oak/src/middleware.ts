import {
  Context,
  isHttpError,
  Status,
  STATUS_TEXT,
} from "https://deno.land/x/oak/mod.ts";
import {
  green,
  cyan,
  bold,
  yellow,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";

export async function xResponseTime(ctx: Context, next: () => Promise<void>) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
}

export async function errorHandler(ctx: Context, next: () => Promise<void>) {
  try {
    await next();
  } catch (err) {
    console.log("errorHandler", err);
    // will be caught by the application
    // const status = isHttpError(err) ? err.status : 500;
    // ctx.throw(status, err.expose ? err.message : Status.InternalServerError)

    const status: Status = isHttpError(err) ? err.status as any : 500;
    ctx.response.status = status;
    ctx.response.body = err.expose ? err.message : STATUS_TEXT.get(status);
  }
}

export async function logger(ctx: Context, next: () => Promise<void>) {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(
    `${green(ctx.request.method)} ${cyan(ctx.request.url.pathname)} - ${
      bold(
        String(rt),
      )
    }`,
  );
}
