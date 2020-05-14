import { Router } from "https://deno.land/x/oak/mod.ts";
import {
  MultipartReader,
} from "https://deno.land/std/mime/multipart.ts";

const router = new Router();

router
  .get("/text", async ctx => {
    ctx.response.body = "text";
  })
  .get("/json", async ctx => {
    ctx.response.body = {
      name: "json"
    };
  })
  .post("/form", async ctx => {
    const body = await ctx.request.body();
    console.log(body);
    const name = body.value.get('name');
    ctx.response.body = {
      name
    };
  })
  .post("/form-data", async ctx => {
    console.log(ctx.request.headers.get("content-disposition"))
    console.log(ctx.request.headers)
    const contentType = ctx.request.headers.get("content-type");
    if (contentType === null || contentType.match("multipart/form-data") === null) {
      return ctx.throw(400, "is not multipart request");
    }
    const m = contentType.match(/boundary=([^ ]+?)$/);
    if (m === null) {
      return ctx.throw(400, "doesn't have boundary");
    }
    const boundary = m[1];
    const body = await ctx.request.body({
      asReader: true
    });
    const mr = new MultipartReader(body.value, boundary);
    const form = await mr.readForm();
    for (let [key, val] of form.entries()) {
      if (typeof val === 'string') {
        console.log('get field:', { key, val });
      } else if (typeof val === 'object') {
        console.log('get file:', { key, ...val, content: "not display" });
        await Deno.writeFile(`./test/${val.filename}`, val.content as Uint8Array);
      }
    }
    ctx.response.body = {
      succes: true
    };
  })
  .post("/raw/:name", async ctx => {
    const { name } = ctx.params;
    const body = await ctx.request.body();
    console.log(body.type);
    await Deno.writeFile(`./test/${name as any}`, body.value);
    ctx.response.body = {
      succes: true
    };
  })

export default router