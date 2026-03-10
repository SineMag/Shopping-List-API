import http, { IncomingMessage, ServerResponse } from "http";
import { itemsRoute } from "./routes/items";

const PORT = 4000;

const requestListener = (req: IncomingMessage, res: ServerResponse) => {
  if (req.url?.startsWith("/items")) {
    itemsRoute(req, res);
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ data: null, error: { code: "NOT_FOUND", message: "Route not found" } }));
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
