import { serve } from "https://deno.land/std@0.50.0/http/server.ts";
import {
  MultipartReader,
} from "https://deno.land/std/mime/multipart.ts";
import { HttpError, throwError } from "./errors.ts";
const s = serve({ port: 8000 });
console.log("http://localhost:8000/");

// just test multipart/form-data
for await (const req of s) {
  try {
    console.log(req.method, req.url);
    if (req.method !== 'POST') {
      req.respond({ body: "use post method and contentType multipart/form-data to upload a file" });
      continue;
    }
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.match("multipart/form-data")) {
      throwError(400, "is not multipart request");
    }
    let m = contentType.match(/boundary=([^ ]+?)$/);
    if (!m) {
      throwError(400, "doesn't have boundary");
    }
    const boundary = m[1];
    const mr = new MultipartReader(req.body, boundary);
    const form = await mr.readForm();
    // console.log(form);
    for (let [key, val] of form.entries()) {
      if (typeof val === 'string') {
        console.log('get field:', { key, val });
      } else if (typeof val === 'object') {
        console.log('get file:', key);
        await Deno.writeFile(`./test/${val.filename}`, val.content as Uint8Array);
        // const file = form.file(key);
        // if (file && file.content) {
        //   await Deno.writeFile(`./test/${file.filename}`, file.content);
        // }
      }
    }
    req.respond({ body: "success" });
  } catch (err) {
    req.respond({
      status: err instanceof HttpError ? err.status : 500,
      body: err.message
    });
  }
}