import { Router } from "https://deno.land/x/oak/mod.ts";
import {
  MultipartReader,
} from "https://deno.land/std/mime/multipart.ts";

const router = new Router();

router
  .get("/text", async (ctx) => {
    ctx.response.body = "text";
  })
  .get("/json", async (ctx) => {
    ctx.response.body = {
      name: "json",
    };
  })
  .post("/form", async (ctx) => {
    const body = await ctx.request.body();
    const { value } = body;
    const name = value.get("name");
    const map = new Map(value); // value: URLSearchParamsImpl
    const _map = new Map(value.entries());
    console.log("====");
    console.log(value.keys()); // Generator {}
    console.log(value.values()); // Generator {}
    console.log(value.entries()); // Generator {}
    console.log(map.keys()); // Map Iterator {}
    console.log(map.values()); // Map Iterator {}
    console.log(map.entries()); // Map Iterator {}
    console.log("====");
    console.log("body =>", body);
    console.log("map =>", map);
    console.log("_map2 =>", _map);
    console.log(Array.from(map));
    console.log([...map]);
    ctx.response.body = {
      name,
      notExist: value.get("notExist value is null"),
      form: {
        keys: Array.from(value.keys()),
        values: [...value.values()],
        entries: Array.from(value),
      },
      map: {
        keys: [...map.keys()],
        values: Array.from(map.values()),
        entries: [...map],
      },
    };
  })
  .post("/json", async (ctx) => {
    const body = await ctx.request.body();
    const { type } = body;
    if (type !== "json") {
      ctx.throw(400, "only support json");
    }

    // No runtime type checking
    interface Person {
      name: string;
      age: number;
    }
    const value: Person = body.value;

    ctx.response.body = {
      body,
      name: value.name,
    };
  })
  .post("/form-data", async (ctx) => {
    // console.log(ctx.request.headers);
    const contentType = ctx.request.headers.get("content-type");
    if (
      contentType === null ||
      contentType.match("multipart/form-data") === null
    ) {
      ctx.throw(400, "is not multipart request");
    }
    const m = contentType!.match(/boundary=([^ ]+?)$/);
    if (m === null) {
      ctx.throw(400, "doesn't have boundary");
    }
    const boundary = m![1];
    const body = await ctx.request.body({
      asReader: true,
    });
    const mr = new MultipartReader(body.value, boundary);
    const form = await mr.readForm();
    for (let [key, val] of form.entries()) {
      if (typeof val === "string") {
        console.log("get field:", { key, val });
      } else if (typeof val === "object") {
        console.log("get file:", { key, ...val, content: "not display" });
        // await Deno.writeFile(`./test/${val.filename}`, val.content!);
        await Deno.writeFile(
          `./test/${val.filename}`,
          val.content as Uint8Array,
        );
      }
    }
    ctx.response.body = {
      succes: true,
    };
  })
  .post("/raw/:name", async (ctx) => {
    const { name } = ctx.params;
    const { type, value } = await ctx.request.body();
    if (type === "undefined") {
      ctx.throw(400, "Can't find raw body");
    }
    const parse = (v: any): Uint8Array | undefined => {
      if (type === "raw") return v;
      const encoder = new TextEncoder();
      if (type === "json") v = JSON.stringify(v);
      if (type === "text") return encoder.encode(v);
      ctx.throw(400, `unexpect value of type: ${type}`);
    };
    const data = parse(value);
    await Deno.writeFile(`./test/${name!}`, data!);
    ctx.response.body = {
      succes: true,
    };
  });

export default router;
