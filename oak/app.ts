import {
  Application,
} from "https://deno.land/x/oak/mod.ts";
import {
  xResponseTime,
  errorHandler,
  logger,
} from "./src/middleware.ts";
import {
  bold,
  yellow,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";
import router from "./src/router.ts";

const app = new Application();

app.addEventListener("error", (e) => {
  console.log("addEventListener", e.error);
});

app.use(logger);
app.use(xResponseTime);
app.use(errorHandler);
app.use(router.routes());
app.use(router.allowedMethods());

const options = { hostname: "127.0.0.1", port: 8000 };
console.log(
  bold("Start listening on ") + yellow(`${options.hostname}:${options.port}`),
);
await app.listen(options);
