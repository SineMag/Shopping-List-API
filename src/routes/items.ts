import { IncomingMessage, ServerResponse } from "http";
import { addItem, deleteItem, getItemById, getItems, updateItem } from "../controllers/items";

type ErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "SERVER_ERROR";

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
};

const sendError = (res: ServerResponse, status: number, code: ErrorCode, message: string) => {
  sendJson(res, status, { data: null, error: { code, message } });
};

const getPathSegments = (url: string | undefined): string[] => {
  if (!url) {
    return [];
  }
  return url.split("?")[0].split("/").filter(Boolean);
};

const parseJsonBody = (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isValidQuantity = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

export const itemsRoute = async (req: IncomingMessage, res: ServerResponse) => {
  const segments = getPathSegments(req.url);
  const resource = segments[0];
  const idSegment = segments[1];

  if (resource !== "items") {
    sendError(res, 404, "NOT_FOUND", "Route not found");
    return;
  }

  if (segments.length > 2) {
    sendError(res, 404, "NOT_FOUND", "Route not found");
    return;
  }

  const id = idSegment !== undefined ? Number(idSegment) : undefined;
  if (idSegment !== undefined && (!Number.isInteger(id) || id <= 0)) {
    sendError(res, 400, "BAD_REQUEST", "Item id must be a positive integer");
    return;
  }

  if (req.method === "GET" && id === undefined) {
    sendJson(res, 200, { data: getItems(), error: null });
    return;
  }

  if (req.method === "GET" && id !== undefined) {
    const item = getItemById(id);
    if (!item) {
      sendError(res, 404, "NOT_FOUND", "Item not found");
      return;
    }
    sendJson(res, 200, { data: item, error: null });
    return;
  }

  if (req.method === "POST" && id === undefined) {
    try {
      const body = (await parseJsonBody(req)) as {
        name?: unknown;
        quantity?: unknown;
        purchased?: unknown;
      };

      if (!isNonEmptyString(body.name)) {
        sendError(res, 400, "BAD_REQUEST", "Field 'name' is required");
        return;
      }
      if (!isValidQuantity(body.quantity)) {
        sendError(res, 400, "BAD_REQUEST", "Field 'quantity' must be a positive number");
        return;
      }
      if (body.purchased !== undefined && !isBoolean(body.purchased)) {
        sendError(res, 400, "BAD_REQUEST", "Field 'purchased' must be a boolean");
        return;
      }

      const newItem = addItem(body.name, body.quantity, body.purchased ?? false);
      sendJson(res, 201, { data: newItem, error: null });
      return;
    } catch {
      sendError(res, 400, "BAD_REQUEST", "Invalid JSON body");
      return;
    }
  }

  if (req.method === "PUT" && id !== undefined) {
    try {
      const body = (await parseJsonBody(req)) as {
        name?: unknown;
        quantity?: unknown;
        purchased?: unknown;
      };

      if (body.name === undefined && body.quantity === undefined && body.purchased === undefined) {
        sendError(res, 400, "BAD_REQUEST", "At least one field must be provided");
        return;
      }
      if (body.name !== undefined && !isNonEmptyString(body.name)) {
        sendError(res, 400, "BAD_REQUEST", "Field 'name' must be a non-empty string");
        return;
      }
      if (body.quantity !== undefined && !isValidQuantity(body.quantity)) {
        sendError(res, 400, "BAD_REQUEST", "Field 'quantity' must be a positive number");
        return;
      }
      if (body.purchased !== undefined && !isBoolean(body.purchased)) {
        sendError(res, 400, "BAD_REQUEST", "Field 'purchased' must be a boolean");
        return;
      }

      const updated = updateItem(id, {
        name: body.name as string | undefined,
        quantity: body.quantity as number | undefined,
        purchased: body.purchased as boolean | undefined,
      });

      if (!updated) {
        sendError(res, 404, "NOT_FOUND", "Item not found");
        return;
      }

      sendJson(res, 200, { data: updated, error: null });
      return;
    } catch {
      sendError(res, 400, "BAD_REQUEST", "Invalid JSON body");
      return;
    }
  }

  if (req.method === "DELETE" && id !== undefined) {
    const deleted = deleteItem(id);
    if (!deleted) {
      sendError(res, 404, "NOT_FOUND", "Item not found");
      return;
    }
    res.writeHead(204);
    res.end();
    return;
  }

  sendError(res, 404, "NOT_FOUND", "Route not found");
};
