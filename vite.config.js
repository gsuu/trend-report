import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

function localApiPlugin() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use("/api/subscribe", async (request, response) => {
        try {
          const { default: handler } = await import("./api/subscribe.js");
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
