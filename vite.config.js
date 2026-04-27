import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

function localApiPlugin() {
  async function runHandler(handlerPath, request, response) {
    try {
      const { default: handler } = await import(handlerPath);
      response.status = (statusCode) => {
        response.statusCode = statusCode;
        return response;
      };
      response.json = (data) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(data));
      };
      await handler(request, response);
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ ok: false, error: error.message }));
    }
  }

  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use("/api/subscribe", async (request, response) => {
        await runHandler("./api/subscribe.js", request, response);
      });
      server.middlewares.use("/api/magazine", async (request, response) => {
        await runHandler("./api/magazine.js", request, response);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [vue(), localApiPlugin()],
    build: {
      outDir: "dist",
    },
  };
});
