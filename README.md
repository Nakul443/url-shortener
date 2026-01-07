## URL Shortener

A simple URL shortener service built with **Node.js**, **Express**, **TypeScript**, and **MySQL**.  
It exposes APIs to:

- **Create** a shortened URL for a given long URL.
- **Redirect** from a shortened URL to the original URL.
- **Fetch basic performance stats** (views count) for a URL.

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Database**: MySQL (`mysql2/promise`)
- **Hashing**: `ts-md5` (first 8 chars of MD5 hash used as the short code)

---

## Project Structure

- **`src/app.ts`**: Express app bootstrap, middleware, and route mounting.
- **`src/routes/urlRoutes.ts`**: Defines HTTP routes for URL-related operations.
- **`src/controllers/urlController.ts`**: Request handlers (business logic + DB access orchestration).
- **`src/services/urlService.ts`**: URL hashing and validation helpers.
- **`src/db.ts`**: MySQL connection helper (singleton style).
- **`tsconfig.json`**: TypeScript configuration.

Compiled JavaScript is emitted into the **`dist`** directory by the TypeScript compiler.

---

## Prerequisites

- **Node.js** (LTS recommended)
- **npm** (comes with Node)
- **MySQL** server running locally (or accessible remotely)

You should have a MySQL database created, e.g.:

- **Database name**: `url_shortener`
- **User**: `root`
- **Password**: `root`

> These values are currently hard-coded in `src/db.ts`.  
> Update them there if your local credentials differ.

Example minimal schema (adjust as needed):

```sql
CREATE DATABASE IF NOT EXISTS url_shortener;
USE url_shortener;

CREATE TABLE urls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url TEXT NOT NULL,
  shortened_url VARCHAR(32) NOT NULL UNIQUE,
  user_id INT NULL
);

CREATE TABLE clicks (
  id INT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Installation & Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Compile TypeScript & start the server**

   ```bash
   npm start
   ```

   This runs:

   - `npx tsc` – compiles TypeScript from `src` into `dist`
   - `node dist/app.js` – starts the Express server

3. **Server URL**

   By default, the server listens on:

   - **Base URL**: `http://localhost:3000`

---

## API Reference

All routes are mounted from `urlRoutes.ts` at the root path (`/`).

### 1. Create Short URL

- **Method**: `POST`
- **Path**: `/urls/createShortURL`
- **Body (JSON)**:

  ```json
  {
    "url": "https://example.com/some/long/path",
    "userId": 1
  }
  ```

  - **`url`**: required, must be a valid HTTP/HTTPS URL.
  - **`userId`**: optional, numeric; stored as `user_id` in DB (can be `null`).

- **Responses**:

  - `201 Created`:

    ```json
    {
      "url": "https://example.com/some/long/path",
      "shortened_url": "abcd1234",
      "userId": 1
    }
    ```

  - `400 Bad Request`:

    ```json
    { "error": "INVALID URL" }
    ```

  - `500 Internal Server Error`:

    ```json
    { "error": "INTERNAL_SERVER_ERROR" }
    ```

---

### 2. Get URL Performance

- **Method**: `GET`
- **Path**: `/url/performance/:id`

  - `:id` – the numeric `id` of the URL record in the `urls` table.

- **Responses**:

  - `200 OK`:

    ```json
    {
      "id": 1,
      "url": "https://example.com/some/long/path",
      "shortened_url": "abcd1234",
      "views": 42
    }
    ```

    - `views` is computed as `COUNT(clicks.id)` joined on the `urls.id`.

  - `400 Bad Request`:

    ```json
    { "error": "INVALID_ID" }
    ```

  - `404 Not Found`:

    ```text
    URL NOT FOUND
    ```

  - `500 Internal Server Error`:

    ```json
    { "error": "INTERNAL_SERVER_ERROR" }
    ```

---

### 3. Redirect Short URL

- **Method**: `GET`
- **Path**: `/:hash`

  - `:hash` – the short code generated from the MD5 hash (first 8 characters).

- **Behavior**:

  - Looks up the original `url` by `shortened_url = :hash` in `urls`.
  - Inserts a new row into `clicks` with the matching `id` and the current timestamp.
  - Issues an HTTP redirect to the original URL.

- **Responses**:

  - `302` (or default redirect status) to the original URL.
  - `404 Not Found` with body:

    ```text
    URL NOT FOUND
    ```

  - `500 Internal Server Error`:

    ```json
    { "error": "INTERNAL_SERVER_ERROR" }
    ```

---

## Development Notes

- **Hashing**: Implemented in `urlService.ts` via `Md5.hashStr(originalUrl)`, truncated to 8 characters for brevity.
- **Validation**: `isValidUrl` uses a regular expression to enforce basic `http`/`https` URL shape.
- **DB access**: All database access uses the shared connection from `db.ts`.

To run type-checks without emitting compiled JS:

```bash
npx tsc --pretty false --noEmit
```

---

## Future Improvements (Ideas)

- Add authentication / authorization (JWT).
- Add rate limiting for URL creation.
- Improve URL validation and error messaging.
- Add more detailed analytics (time-windowed stats, unique visitors, etc.).