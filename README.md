<img src="https://socialify.git.ci/SineMag/Shopping-List-API/image?language=1&owner=1&name=1&stargazers=1&theme=Light" alt="Shopping-List-API" width="640" height="320" />

# Shopping List API

Simple REST API for managing a shopping list. Runs on Node.js with TypeScript and stores items in memory.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/SineMag/Shopping-List-API.git
cd Shopping-List-API
```

2. Install dependencies:

```bash
npm install
```

3. Start the server (default `http://localhost:4000`):

```bash
npm run dev
```

## Project Structure

```text
Shopping-List-API/
  src/
    controllers/
      items.ts
    routes/
      items.ts
    types/
      item.ts
    server.ts
  package.json
  tsconfig.json
  README.md
```

## Data Model

```json
{
  "id": 1,
  "name": "Milk",
  "quantity": 2,
  "purchased": false
}
```

## Response Shape

Successful responses:

```json
{
  "data": {},
  "error": null
}
```

Error responses:

```json
{
  "data": null,
  "error": {
    "code": "BAD_REQUEST",
    "message": "..."
  }
}
```

## Endpoints

- `POST /items` - Create a new item
- `GET /items` - Get all items
- `GET /items/:id` - Get a single item by id
- `PUT /items/:id` - Update an item
- `DELETE /items/:id` - Delete an item (returns `204 No Content`)

## Example Requests

Create item:

```bash
curl -X POST http://localhost:4000/items -H "Content-Type: application/json" -d "{\"name\":\"Milk\",\"quantity\":2}"
```

Update item:

```bash
curl -X PUT http://localhost:4000/items/1 -H "Content-Type: application/json" -d "{\"purchased\":true}"
```
