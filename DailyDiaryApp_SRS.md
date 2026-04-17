**Daily Diary App — SRS v1.0**    |    Confidential    |    Flutter + Node.js/TS + PostgreSQL + Cloudinary

**Daily Diary Application**

Software Requirements Specification (SRS)

Version 1.0.0  |  Confidential

|**Field**|**Details**|
| :- | :- |
|**Document Version**|v1.0.0 — Initial Release|
|**Status**|Approved for Development|
|**Date**|17 April 2026|
|**Mobile Frontend**|Flutter (Dart 3.x) — iOS & Android|
|**Backend**|Node.js / TypeScript — backend\_server/ folder|
|**Architecture Pattern**|MCP (Model – Context – Protocol)|
|**Database**|PostgreSQL v15+|
|**Image Platform**|Cloudinary CDN|
|**Auth**|bcrypt + JWT (access 15m / refresh 7d)|
|**Encryption**|AES-256-GCM — per-user key stored in DB|


# **1. Introduction**

## **1.1 Purpose**
This Software Requirements Specification (SRS) defines all functional, non-functional, and architectural requirements for the Daily Diary Application. It is the single authoritative reference for developers, designers, QA engineers, and project managers throughout the development lifecycle.

## **1.2 Project Overview**
The Daily Diary App is a secure cross-platform mobile journaling solution. Users write rich-text diary entries tied to specific calendar dates, embed images stored on Cloudinary, and benefit from AES-256-GCM encryption of all diary content — using a unique key per user that is generated at registration and stored in PostgreSQL. The Node.js/TypeScript backend lives in the backend\_server/ folder and follows the MCP (Model-Context-Protocol) layered architecture for clear separation of concerns.

## **1.3 Scope**
- User registration and login with bcrypt password hashing and JWT authentication.
- Calendar-based home screen that highlights dates with existing diary entries.
- Rich-text diary editor: bold, italic, underline, headings, lists, alignment, font color.
- Image upload per entry — streamed directly to Cloudinary; secure URL stored in PostgreSQL.
- Full CRUD on diary entries (Create, Read, Update, Delete) with soft-delete support.
- Per-user AES-256-GCM encryption key — generated at registration, stored in DB, never sent to client.
- RESTful JSON API backend in TypeScript + Express.js.

## **1.4 Definitions & Acronyms**

|**Term**|**Definition**|
| :- | :- |
|**SRS**|Software Requirements Specification|
|**MCP**|Model-Context-Protocol — layered backend architecture (Model=DB, Context=business logic, Protocol=HTTP handlers)|
|**JWT**|JSON Web Token — compact, stateless authentication token|
|**AES-256-GCM**|Advanced Encryption Standard 256-bit in Galois/Counter Mode — authenticated encryption|
|**bcrypt**|Adaptive password hashing algorithm; cost factor 12 used throughout this project|
|**IV / Nonce**|Initialization Vector — unique 16-byte random value generated per encryption operation|
|**GCM Auth Tag**|16-byte integrity tag produced by AES-GCM; verifies ciphertext has not been tampered with|
|**CDN**|Content Delivery Network — Cloudinary delivers uploaded images via global CDN|
|**Prisma**|Type-safe ORM for PostgreSQL used in the backend\_server/ project|
|**flutter\_quill**|Flutter package implementing the Quill rich-text editor using Delta JSON format|
|**Delta JSON**|Quill's document format — a list of retain/insert/delete operations describing rich text|


# **2. System Overview & Architecture**

## **2.1 High-Level Architecture**
The system is a 3-tier client-server application. The Flutter app communicates with the Express.js backend over HTTPS. The backend uses the MCP pattern internally and connects to PostgreSQL and Cloudinary.

|**Layer**|**Technology**|**Responsibility**|
| :- | :- | :- |
|**Presentation**|Flutter (Dart)|Mobile UI — Calendar, Editor, Login, Register screens. Calls backend REST API via Dio HTTP client.|
|**Protocol Layer**|Express.js Route Handlers|Receives HTTP requests, validates input with zod, invokes Context layer, returns JSON. Handles JWT middleware.|
|**Context Layer**|TypeScript Services|Business logic — orchestrates encryption/decryption, Cloudinary uploads, auth token lifecycle.|
|**Model Layer**|PostgreSQL via Prisma|Database CRUD — users, diary\_entries, entry\_images, refresh\_tokens tables.|
|**Image Storage**|Cloudinary Node.js SDK|Receives image buffers, returns CDN URLs saved to the DB.|

## **2.2 MCP Folder Structure — backend\_server/**

|<p>backend\_server/</p><p>├── src/</p><p>│   ├── models/                  ← MODEL LAYER (DB queries)</p><p>│   │   ├── user.model.ts</p><p>│   │   ├── entry.model.ts</p><p>│   │   └── image.model.ts</p><p>│   ├── contexts/                ← CONTEXT LAYER (business logic)</p><p>│   │   ├── auth.context.ts</p><p>│   │   ├── entry.context.ts</p><p>│   │   ├── encryption.context.ts</p><p>│   │   └── cloudinary.context.ts</p><p>│   ├── protocols/               ← PROTOCOL LAYER (HTTP handlers)</p><p>│   │   ├── auth.protocol.ts</p><p>│   │   └── entry.protocol.ts</p><p>│   ├── middleware/</p><p>│   │   ├── auth.middleware.ts   (JWT verification)</p><p>│   │   └── upload.middleware.ts (multer image parsing)</p><p>│   ├── routes/</p><p>│   │   ├── auth.routes.ts</p><p>│   │   └── entry.routes.ts</p><p>│   ├── config/</p><p>│   │   ├── database.ts          (Prisma client)</p><p>│   │   └── cloudinary.ts        (Cloudinary config)</p><p>│   └── app.ts                   (Express app bootstrap)</p><p>├── prisma/</p><p>│   └── schema.prisma</p><p>├── .env</p><p>└── package.json</p>|
| :- |

## **2.3 Full Technology Stack**

|**Component**|**Technology**|**Notes**|
| :- | :- | :- |
|**Mobile Frontend**|Flutter 3.x (Dart)|iOS 13+ and Android 8.0+|
|**HTTP Client**|Dio|Interceptors for auto token refresh|
|**Rich Text Editor**|flutter\_quill|Delta JSON format|
|**Calendar Widget**|table\_calendar|Event markers, month navigation|
|**Secure Storage**|flutter\_secure\_storage|Keychain (iOS) / Keystore (Android) for tokens|
|**State Management**|Riverpod / Provider|Auth state, entry caching|
|**Backend Framework**|Express.js + TypeScript|Node.js 20+, TypeScript 5.x|
|**Database**|PostgreSQL 15+|Hosted or local|
|**ORM**|Prisma|Type-safe migrations and queries|
|**Password Hashing**|bcrypt|Cost factor 12|
|**Authentication**|jsonwebtoken|Access 15min + Refresh 7 days|
|**Diary Encryption**|Node.js crypto module|AES-256-GCM, per-user key, per-entry IV|
|**Image Storage**|Cloudinary SDK v2|upload\_stream API, folder per user|
|**File Parsing**|multer|In-memory storage before Cloudinary upload|
|**Validation**|zod|All request body schemas|


# **3. Database Schema (PostgreSQL)**

All tables use UUID primary keys generated by gen\_random\_uuid(). All timestamps are stored in UTC (TIMESTAMPTZ). Diary content is stored as AES-256-GCM ciphertext (base64-encoded). A unique constraint on (user\_id, entry\_date) enforces one entry per user per calendar day.

## **3.1 Table: users**

|**Column**|**Type**|**Constraints**|**Description**|
| :- | :- | :- | :- |
|**id**|UUID|PK, DEFAULT gen\_random\_uuid()|Unique user identifier|
|**email**|VARCHAR(255)|UNIQUE, NOT NULL|Login credential|
|**username**|VARCHAR(100)|NOT NULL|Display name|
|**password\_hash**|TEXT|NOT NULL|bcrypt hash (cost 12)|
|**encryption\_key**|TEXT|NOT NULL|Hex-encoded 32-byte AES-256 key, generated at registration, never sent to client|
|**created\_at**|TIMESTAMPTZ|DEFAULT now()|Account creation timestamp|
|**updated\_at**|TIMESTAMPTZ|DEFAULT now()|Last update timestamp|

|<p>**Security — encryption\_key**</p><p>Generated server-side: crypto.randomBytes(32).toString("hex")</p><p>Never included in JWT payloads or API responses.</p><p>Loaded from the DB on every diary read/write operation.</p><p>Deleting a user cascade-deletes the key — rendering their ciphertext permanently unrecoverable.</p>|
| :- |

## **3.2 Table: diary\_entries**

|**Column**|**Type**|**Constraints**|**Description**|
| :- | :- | :- | :- |
|**id**|UUID|PK, DEFAULT gen\_random\_uuid()|Entry identifier|
|**user\_id**|UUID|FK users.id ON DELETE CASCADE|Entry owner|
|**entry\_date**|DATE|NOT NULL|Calendar date of this entry|
|**title**|VARCHAR(255)|NULLABLE|Optional title (stored encrypted)|
|**content\_cipher**|TEXT|NOT NULL|Base64-encoded AES-256-GCM ciphertext of Quill Delta JSON|
|**content\_iv**|VARCHAR(64)|NOT NULL|Hex IV (16 bytes) unique per entry|
|**content\_tag**|VARCHAR(64)|NOT NULL|Hex GCM auth tag (16 bytes) for integrity check|
|**mood**|VARCHAR(50)|NULLABLE|Emoji mood tag|
|**is\_deleted**|BOOLEAN|DEFAULT FALSE|Soft-delete flag|
|**created\_at**|TIMESTAMPTZ|DEFAULT now()|Creation timestamp|
|**updated\_at**|TIMESTAMPTZ|DEFAULT now()|Last save timestamp|

|<p>**Unique Constraint**</p><p>UNIQUE (user\_id, entry\_date) — one diary entry per user per date.</p><p>API uses UPSERT (INSERT ... ON CONFLICT DO UPDATE) to transparently handle both create and update.</p>|
| :- |

## **3.3 Table: entry\_images**

|**Column**|**Type**|**Constraints**|**Description**|
| :- | :- | :- | :- |
|**id**|UUID|PK|Image record identifier|
|**entry\_id**|UUID|FK diary\_entries.id ON DELETE CASCADE|Parent diary entry|
|**user\_id**|UUID|FK users.id ON DELETE CASCADE|Image owner (for auth checks)|
|**cloudinary\_id**|TEXT|NOT NULL|Cloudinary public\_id — used to call delete API|
|**url**|TEXT|NOT NULL|HTTP CDN URL|
|**secure\_url**|TEXT|NOT NULL|HTTPS CDN URL (preferred for display)|
|**format**|VARCHAR(10)|NOT NULL|jpg, png, webp, etc.|
|**width**|INTEGER|NULLABLE|Image width in pixels|
|**height**|INTEGER|NULLABLE|Image height in pixels|
|**bytes**|BIGINT|NULLABLE|File size in bytes|
|**display\_order**|INTEGER|DEFAULT 0|Order within the entry image strip|
|**created\_at**|TIMESTAMPTZ|DEFAULT now()|Upload timestamp|

## **3.4 Table: refresh\_tokens**

|**Column**|**Type**|**Constraints**|**Description**|
| :- | :- | :- | :- |
|**id**|UUID|PK|Token record ID|
|**user\_id**|UUID|FK users.id ON DELETE CASCADE|Owning user|
|**token\_hash**|TEXT|UNIQUE, NOT NULL|SHA-256 hash of the opaque refresh token — raw token never stored|
|**expires\_at**|TIMESTAMPTZ|NOT NULL|Token expiry (7 days from issuance)|
|**revoked**|BOOLEAN|DEFAULT FALSE|Set TRUE on logout to invalidate the token|
|**created\_at**|TIMESTAMPTZ|DEFAULT now()|Issuance timestamp|

## **3.5 Full SQL DDL**

|<p>CREATE EXTENSION IF NOT EXISTS "pgcrypto";</p><p></p><p>CREATE TABLE users (</p><p>`  `id             UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),</p><p>`  `email          VARCHAR(255) UNIQUE NOT NULL,</p><p>`  `username       VARCHAR(100) NOT NULL,</p><p>`  `password\_hash  TEXT NOT NULL,</p><p>`  `encryption\_key TEXT NOT NULL,</p><p>`  `created\_at     TIMESTAMPTZ DEFAULT now(),</p><p>`  `updated\_at     TIMESTAMPTZ DEFAULT now()</p><p>);</p><p></p><p>CREATE TABLE diary\_entries (</p><p>`  `id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),</p><p>`  `user\_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,</p><p>`  `entry\_date      DATE NOT NULL,</p><p>`  `title           VARCHAR(255),</p><p>`  `content\_cipher  TEXT NOT NULL,</p><p>`  `content\_iv      VARCHAR(64) NOT NULL,</p><p>`  `content\_tag     VARCHAR(64) NOT NULL,</p><p>`  `mood            VARCHAR(50),</p><p>`  `is\_deleted      BOOLEAN DEFAULT FALSE,</p><p>`  `created\_at      TIMESTAMPTZ DEFAULT now(),</p><p>`  `updated\_at      TIMESTAMPTZ DEFAULT now(),</p><p>`  `CONSTRAINT uq\_user\_date UNIQUE (user\_id, entry\_date)</p><p>);</p><p></p><p>CREATE TABLE entry\_images (</p><p>`  `id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),</p><p>`  `entry\_id        UUID NOT NULL REFERENCES diary\_entries(id) ON DELETE CASCADE,</p><p>`  `user\_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,</p><p>`  `cloudinary\_id   TEXT NOT NULL,</p><p>`  `url             TEXT NOT NULL,</p><p>`  `secure\_url      TEXT NOT NULL,</p><p>`  `format          VARCHAR(10) NOT NULL,</p><p>`  `width           INTEGER,</p><p>`  `height          INTEGER,</p><p>`  `bytes           BIGINT,</p><p>`  `display\_order   INTEGER DEFAULT 0,</p><p>`  `created\_at      TIMESTAMPTZ DEFAULT now()</p><p>);</p><p></p><p>CREATE TABLE refresh\_tokens (</p><p>`  `id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),</p><p>`  `user\_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,</p><p>`  `token\_hash  TEXT UNIQUE NOT NULL,</p><p>`  `expires\_at  TIMESTAMPTZ NOT NULL,</p><p>`  `revoked     BOOLEAN DEFAULT FALSE,</p><p>`  `created\_at  TIMESTAMPTZ DEFAULT now()</p><p>);</p><p></p><p>-- Performance indexes</p><p>CREATE INDEX idx\_entries\_user\_date ON diary\_entries(user\_id, entry\_date);</p><p>CREATE INDEX idx\_images\_entry      ON entry\_images(entry\_id);</p><p>CREATE INDEX idx\_refresh\_user      ON refresh\_tokens(user\_id);</p>|
| :- |


# **4. API Specification**

All endpoints except POST /auth/register and POST /auth/login require a Bearer JWT in the Authorization header. Responses are JSON. Image upload uses multipart/form-data.

|<p>**Base URL**</p><p>Development:  http://localhost:3000/api/v1</p><p>Production:   https://your-domain.com/api/v1</p>|
| :- |

## **4.1 Authentication Endpoints**
### **POST /auth/register**

|<p>// Request Body</p><p>{</p><p>`  `"email":    "user@example.com",   // required, valid email format</p><p>`  `"username": "JohnDoe",            // required, 3-50 chars</p><p>`  `"password": "SecurePass@123"      // min 8 chars, 1 uppercase, 1 digit, 1 special</p><p>}</p><p></p><p>// Server Steps:</p><p>// 1. Validate input via zod schema</p><p>// 2. Check email uniqueness in users table</p><p>// 3. password\_hash = await bcrypt.hash(password, 12)</p><p>// 4. encryption\_key = crypto.randomBytes(32).toString("hex")</p><p>// 5. INSERT user row with hash + encryption\_key</p><p>// 6. Issue accessToken (JWT 15m) + refreshToken (opaque, 7d)</p><p>// 7. Store sha256(refreshToken) in refresh\_tokens table</p><p></p><p>// Response 201</p><p>{</p><p>`  `"success": true,</p><p>`  `"data": {</p><p>`    `"user": { "id": "uuid", "email": "...", "username": "..." },</p><p>`    `"accessToken":  "<JWT>",</p><p>`    `"refreshToken": "<opaque-token>"</p><p>`  `}</p><p>}</p>|
| :- |

### **POST /auth/login**

|<p>// Request Body</p><p>{ "email": "user@example.com", "password": "SecurePass@123" }</p><p></p><p>// Server Steps:</p><p>// 1. Find user by email</p><p>// 2. bcrypt.compare(password, user.password\_hash)</p><p>// 3. Issue new JWT pair, store refreshToken hash</p><p></p><p>// Response 200</p><p>{</p><p>`  `"success": true,</p><p>`  `"data": { "user": {...}, "accessToken": "...", "refreshToken": "..." }</p><p>}</p>|
| :- |

### **POST /auth/refresh**
Body: { "refreshToken": "..." }. Validates hash in DB, checks revoked flag and expiry, returns new accessToken. Returns 401 if invalid/expired/revoked.

### **POST /auth/logout**
Requires Bearer JWT. Sets revoked=TRUE on the provided refreshToken in the DB. Returns 200 OK.

## **4.2 Diary Entry Endpoints**
### **GET /entries?month=YYYY-MM  (Auth required)**

|<p>// Returns lightweight list of entry dates for the month</p><p>// Used to highlight calendar dates — no content decryption</p><p>{ "success": true, "data": [</p><p>`  `{ "id": "uuid", "entry\_date": "2025-07-14", "has\_images": true },</p><p>`  `{ "id": "uuid", "entry\_date": "2025-07-20", "has\_images": false }</p><p>]}</p>|
| :- |

### **GET /entries/:date  (Auth required)**

|<p>// :date = YYYY-MM-DD</p><p>// Returns full decrypted entry or 404 if no entry exists for that date</p><p>{ "success": true, "data": {</p><p>`  `"id": "uuid",</p><p>`  `"entry\_date": "2025-07-14",</p><p>`  `"title": "A Sunny Day",</p><p>`  `"content": "{ quill delta JSON }",  // DECRYPTED</p><p>`  `"mood": "happy",</p><p>`  `"images": [</p><p>`    `{ "id": "uuid", "secure\_url": "https://res.cloudinary.com/...", "display\_order": 0 }</p><p>`  `],</p><p>`  `"created\_at": "...", "updated\_at": "..."</p><p>}}</p><p></p><p>// Decryption:</p><p>// 1. Load entry + user.encryption\_key from DB</p><p>// 2. decipher = createDecipheriv("aes-256-gcm", keyBuf, ivBuf)</p><p>// 3. decipher.setAuthTag(tagBuf)</p><p>// 4. plaintext = decipher.update(cipherBuf) + decipher.final()</p>|
| :- |

### **POST /entries  (Auth required)**

|<p>// Request Body</p><p>{ "entry\_date": "2025-07-15", "title": "My Day",</p><p>`  `"content": "{quill delta}", "mood": "happy" }</p><p></p><p>// Encryption before INSERT:</p><p>// iv = crypto.randomBytes(16)</p><p>// cipher = createCipheriv("aes-256-gcm", userKey, iv)</p><p>// ciphertext = cipher.update(content) + cipher.final()</p><p>// tag = cipher.getAuthTag()</p><p>// Stores: content\_cipher, content\_iv, content\_tag</p><p></p><p>// Response 201: { "success": true, "data": { "id": "uuid", ... } }</p>|
| :- |

### **PUT /entries/:id  (Auth required)**
Update title, content, or mood of an existing entry. Content is re-encrypted with a fresh IV on every save. Only the authenticated owner can update. Returns 403 if another user attempts access. Returns updated entry metadata (not decrypted content).

### **DELETE /entries/:id  (Auth required)**
Soft-deletes entry (is\_deleted = TRUE). Calls cloudinary.uploader.destroy(cloudinary\_id) for every associated image and removes entry\_images rows. Returns 200 OK.

## **4.3 Image Endpoints**
### **POST /entries/:id/images  (Auth required, multipart/form-data)**

|<p>// Field name: "images" (supports multiple files)</p><p>// Max: 10MB per file, 10 images per entry</p><p></p><p>// Upload flow:</p><p>// 1. multer parses buffer in memory</p><p>// 2. Verify entry belongs to authenticated user</p><p>// 3. cloudinary.uploader.upload\_stream({ folder: "diary/{userId}" })</p><p>// 4. INSERT row into entry\_images with cloudinary\_id + secure\_url</p><p></p><p>// Response 201</p><p>{ "success": true, "data": [</p><p>`  `{ "id": "uuid", "secure\_url": "https://res.cloudinary.com/...",</p><p>`    `"format": "jpg", "width": 1080, "height": 720 }</p><p>]}</p>|
| :- |

### **DELETE /entries/:entryId/images/:imageId  (Auth required)**
Verifies image ownership, calls Cloudinary destroy API using cloudinary\_id, deletes the entry\_images record. Returns 404 if not found or unauthorized.

## **4.4 Standard Error Response**

|<p>{ "success": false, "error": {</p><p>`  `"code":    "ENTRY\_NOT\_FOUND",</p><p>`  `"message": "No entry exists for this date",</p><p>`  `"details": []   // zod validation errors if applicable</p><p>}}</p>|
| :- |

|**HTTP Status**|**Error Code**|**Trigger Condition**|
| :- | :- | :- |
|**400**|VALIDATION\_ERROR|Request body fails zod schema validation|
|**401**|UNAUTHORIZED|Missing, expired, or invalid JWT|
|**403**|FORBIDDEN|Resource belongs to a different user|
|**404**|ENTRY\_NOT\_FOUND|No diary entry for requested date or ID|
|**409**|EMAIL\_ALREADY\_EXISTS|Registration with a duplicate email|
|**422**|DECRYPTION\_FAILED|GCM auth tag check fails (data tampered)|
|**500**|INTERNAL\_ERROR|Unexpected server error|


# **5. Functional Requirements**

## **5.1 Authentication Module**

|**ID**|**Requirement**|**Acceptance Criteria**|
| :- | :- | :- |
|**FR-A01**|User Registration|Email, username, password validated by zod. bcrypt(cost=12) hash stored. 256-bit encryption\_key generated and stored. JWT pair returned.|
|**FR-A02**|User Login|bcrypt.compare() verifies password. New JWT pair issued and returned. refreshToken hash stored in refresh\_tokens.|
|**FR-A03**|Token Refresh|Valid non-revoked refreshToken returns a new accessToken without re-login.|
|**FR-A04**|Logout|refreshToken marked revoked in DB. Subsequent use returns 401.|
|**FR-A05**|Password Rules|Min 8 chars, 1 uppercase, 1 digit, 1 special character. Enforced by zod server-side and Flutter validator client-side.|
|**FR-A06**|Flutter — Register Screen|Fields: email, username, password, confirm password. Password strength indicator. On success navigate to Home and store tokens.|
|**FR-A07**|Flutter — Login Screen|Fields: email, password. Show/hide password toggle. Auto-navigate to Home on success. Tokens stored in flutter\_secure\_storage.|

## **5.2 Home Screen — Calendar**

|**ID**|**Requirement**|**Acceptance Criteria**|
| :- | :- | :- |
|**FR-H01**|Monthly Calendar Display|table\_calendar widget renders full month. Current date highlighted. Navigation between months with arrow buttons or swipe.|
|**FR-H02**|Highlight Entry Dates|GET /entries?month= fetched on load and month change. Dates with entries display a colored dot marker.|
|**FR-H03**|Navigate to Editor on Tap|Tapping any date navigates to DiaryEditorScreen passing that date string.|
|**FR-H04**|Today Button|Header or FAB button snaps calendar to current month and highlights today.|
|**FR-H05**|Logout|AppBar trailing icon calls POST /auth/logout, clears secure storage, navigates to LoginScreen.|

## **5.3 Diary Editor Screen**

|**ID**|**Requirement**|**Acceptance Criteria**|
| :- | :- | :- |
|**FR-E01**|Load Existing Entry|On open, GET /entries/:date called. If 200: populate QuillEditor with decrypted Delta JSON and render image strip. If 404: empty editor.|
|**FR-E02**|Rich Text Editing|QuillToolbar exposes: Bold, Italic, Underline, Strikethrough, Heading 1/2, Bullet list, Numbered list, Align left/center/right, Font color, Background color.|
|**FR-E03**|Title Field|Plain-text TextField above editor. Max 255 chars. Included in save request.|
|**FR-E04**|Mood Selector|Row of tappable emoji chips. Selected mood highlighted. Sent as "mood" field on save.|
|**FR-E05**|Save Entry|Save FAB (and auto-save on 3s idle) calls POST /entries or PUT /entries/:id. Success snackbar shown.|
|**FR-E06**|Delete Entry|AppBar delete icon. Confirmation dialog. On confirm: DELETE /entries/:id. Navigate back to Home.|
|**FR-E07**|Image Upload|Image picker button opens gallery or camera. File sent via POST /entries/:id/images (multipart). Uploaded image appended to horizontal image strip.|
|**FR-E08**|Delete Image|X button on image thumbnail. DELETE /entries/:entryId/images/:imageId called. Image removed from strip on success.|
|**FR-E09**|Full-Screen Image Viewer|Tapping image thumbnail opens PhotoViewGallery. Pinch-to-zoom, swipe between images.|
|**FR-E10**|Date Label|Non-editable date label: e.g. "Monday, 14 July 2025". Shows at top of editor.|
|**FR-E11**|Unsaved Changes Guard|Navigating back with unsaved changes shows dialog: Save / Discard / Cancel.|


# **6. Encryption & Security Design**

## **6.1 Per-User Encryption Key Strategy**
Each user receives a unique 256-bit (32-byte) AES key generated at registration using Node.js crypto.randomBytes(32). This key is stored in hex format in users.encryption\_key. It is NEVER included in JWTs, NEVER returned to the client, and is ONLY loaded server-side when reading or writing diary entries.

|<p>**Why per-user keys?**</p><p>`  `Compromise of one account does not expose any other user's data.</p><p>`  `Account deletion removes the key, making stored ciphertext permanently unrecoverable.</p><p>`  `Each entry also uses its own unique IV, so identical content produces different ciphertext every time.</p>|
| :- |

## **6.2 Encryption — Write Path (TypeScript)**

|<p>// src/contexts/encryption.context.ts</p><p>import crypto from 'node:crypto';</p><p></p><p>export function encryptContent(plaintext: string, hexKey: string) {</p><p>`  `const key = Buffer.from(hexKey, "hex");       // 32 bytes</p><p>`  `const iv  = crypto.randomBytes(16);           // unique IV per entry</p><p></p><p>`  `const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);</p><p>`  `const encrypted = Buffer.concat([</p><p>`    `cipher.update(plaintext, "utf8"),</p><p>`    `cipher.final()</p><p>`  `]);</p><p>`  `const tag = cipher.getAuthTag();              // 16-byte GCM tag</p><p></p><p>`  `return {</p><p>`    `content\_cipher: encrypted.toString("base64"),</p><p>`    `content\_iv:     iv.toString("hex"),</p><p>`    `content\_tag:    tag.toString("hex"),</p><p>`  `};</p><p>}</p>|
| :- |

## **6.3 Decryption — Read Path (TypeScript)**

|<p>export function decryptContent(</p><p>`  `cipherBase64: string, ivHex: string, tagHex: string, hexKey: string</p><p>): string {</p><p>`  `const key       = Buffer.from(hexKey,       "hex");</p><p>`  `const iv        = Buffer.from(ivHex,        "hex");</p><p>`  `const tag       = Buffer.from(tagHex,       "hex");</p><p>`  `const encrypted = Buffer.from(cipherBase64, "base64");</p><p></p><p>`  `const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);</p><p>`  `decipher.setAuthTag(tag);  // integrity check — throws if tampered</p><p></p><p>`  `try {</p><p>`    `return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");</p><p>`  `} catch {</p><p>`    `throw new Error("DECRYPTION\_FAILED");</p><p>`  `}</p><p>}</p>|
| :- |

## **6.4 Authentication Security**
- Passwords: bcrypt.hash(password, 12) — ~300ms per hash, brute-force resistant.
- JWT: Short-lived accessToken (15min) + opaque refreshToken (7d). JWT signed with 64+ char secret.
- Refresh tokens: Only SHA-256 hash stored in DB. Raw token never persisted.
- Logout: Marks token revoked. All subsequent use returns 401.
- JWT payload contains only: { sub: userId, iat, exp } — no sensitive data.

## **6.5 Transport & Storage Security**
- HTTPS (TLS 1.2+) enforced in production. HTTP requests redirected.
- Flutter stores tokens in flutter\_secure\_storage — Keychain (iOS) / Keystore (Android).
- CORS configured to allow only the app domain origin.
- Server logs never contain raw diary content, passwords, or encryption keys.


# **7. Flutter Screen Specifications**

## **7.1 App Navigation Flow**

|<p>App Launch</p><p>`  `└─> Check flutter\_secure\_storage for JWT</p><p>`       `├─ Valid token  ──> HomeScreen (Calendar)</p><p>`       `└─ No/expired   ──> LoginScreen</p><p>`                             `├─ Login ───────────> HomeScreen</p><p>`                             `└─ "Register" link -> RegisterScreen</p><p>`                                                      `└─ Success -> HomeScreen</p><p></p><p>HomeScreen</p><p>`  `└─ Tap any date ─────────────────────────────> DiaryEditorScreen(date)</p><p>`                                                    `├─ Entry exists: load content</p><p>`                                                    `└─ No entry:    empty editor</p><p>`                                                          `├─ Save   (POST/PUT)</p><p>`                                                          `├─ Delete (DELETE)</p><p>`                                                          `└─ Upload image -> strip</p><p>`                                                               `└─ Tap image -> ImageViewerScreen</p>|
| :- |

## **7.2 Screen Inventory**

|**Screen**|**Route**|**Key Features**|
| :- | :- | :- |
|**SplashScreen**|/splash|Logo animation. Auth state check. Redirects to /login or /home.|
|**LoginScreen**|/login|Email + password fields, show/hide toggle. flutter\_secure\_storage token save. "Register" link.|
|**RegisterScreen**|/register|Email, username, password, confirm password. Regex validation. Password strength bar. On success store tokens and go to Home.|
|**HomeScreen**|/home|TableCalendar with event markers on entry dates. AppBar logout button. Pull-to-refresh. Tap date to navigate to editor.|
|**DiaryEditorScreen**|/entry/:date|QuillEditor + QuillToolbar. Title field. Mood selector. Image strip (horizontal ListView). Save FAB. Delete icon. Unsaved changes guard.|
|**ImageViewerScreen**|/image|PhotoViewGallery with swipe between entry images, pinch-to-zoom, close button.|

## **7.3 Required Flutter Packages (pubspec.yaml)**

|**Package**|**Purpose**|
| :- | :- |
|**flutter\_quill**|Rich-text editor with bold/italic/underline/lists/headings/alignment — Delta JSON format|
|**table\_calendar**|Full calendar widget with event markers and month navigation|
|**flutter\_secure\_storage**|Platform-native secure token storage (Keychain/Keystore)|
|**dio**|HTTP client with interceptors for automatic JWT refresh on 401|
|**image\_picker**|Gallery and camera access for diary image selection|
|**photo\_view**|Zoomable full-screen image viewer with gallery swipe|
|**riverpod / provider**|State management: auth state, entry data, loading and error states|
|**go\_router**|Declarative routing with auth guards and deep link support|
|**intl**|Locale-aware date formatting for editor date label|
|**cached\_network\_image**|Efficient caching of Cloudinary CDN images|
|**lottie**|Animated splash screen and empty-state illustrations|


# **8. Non-Functional Requirements**

|**ID**|**Category**|**Requirement**|
| :- | :- | :- |
|**NFR-01**|Performance|API p95 response < 400ms for text endpoints. Image upload completes in < 5s for files up to 5MB.|
|**NFR-02**|Scalability|Stateless JWT auth enables horizontal backend scaling. No server-side session state.|
|**NFR-03**|Security|Passwords bcrypt-hashed. Diary content AES-256-GCM encrypted at rest. HTTPS enforced. Short-lived JWTs. Refresh token hashed in DB.|
|**NFR-04**|Availability|Production backend uptime SLA 99.5%.|
|**NFR-05**|Data Integrity|GCM auth tag verified on every decryption. Any tampering throws DECRYPTION\_FAILED (422).|
|**NFR-06**|Compatibility|Flutter app supports Android 8.0+ and iOS 13+. Accessible color contrast and system font scaling.|
|**NFR-07**|Image Limits|Max 10MB per image. Max 10 images per diary entry. Enforced at multer middleware and zod validation layers.|
|**NFR-08**|Logging|Structured JSON server logs with request ID. Logs must NOT contain raw diary text, encryption keys, or plain passwords.|
|**NFR-09**|Testability|Each MCP layer has unit tests. API routes have integration tests via supertest.|
|**NFR-10**|Offline|Flutter app shows cached content and displays offline banner on network loss. Graceful error states on all screens.|


# **9. Environment Configuration**

## **9.1 Backend .env (backend\_server/)**

|<p># Server</p><p>PORT=3000</p><p>NODE\_ENV=development</p><p></p><p># PostgreSQL (Prisma)</p><p>DATABASE\_URL="postgresql://user:password@localhost:5432/diary\_db"</p><p></p><p># JWT</p><p>JWT\_SECRET="<minimum-64-character-random-string>"</p><p>JWT\_ACCESS\_EXPIRES="15m"</p><p>JWT\_REFRESH\_EXPIRES="7d"</p><p></p><p># Cloudinary</p><p>CLOUDINARY\_CLOUD\_NAME="your\_cloud\_name"</p><p>CLOUDINARY\_API\_KEY="your\_api\_key"</p><p>CLOUDINARY\_API\_SECRET="your\_api\_secret"</p><p></p><p># Limits</p><p>BCRYPT\_SALT\_ROUNDS=12</p><p>MAX\_IMAGE\_SIZE\_MB=10</p><p>MAX\_IMAGES\_PER\_ENTRY=10</p>|
| :- |

## **9.2 Flutter Environment**

|<p>// lib/config/api\_config.dart</p><p>class ApiConfig {</p><p>`  `static const String baseUrl = String.fromEnvironment(</p><p>`    `"API\_BASE\_URL",</p><p>`    `defaultValue: "http://10.0.2.2:3000/api/v1",</p><p>`  `);</p><p>}</p><p></p><p>// Run: flutter run --dart-define=API\_BASE\_URL=https://your-api.com/api/v1</p>|
| :- |


# **10. Revision History**

|**Version**|**Date**|**Author**|**Summary**|
| :- | :- | :- | :- |
|**1.0.0**|17/4/2026|Development Team|Initial SRS — Full specification including database schema (PostgreSQL), REST API, AES-256-GCM encryption design, MCP architecture, Flutter screen specs, and NFRs.|

|<p>**Sign-Off**</p><p>This document is approved for development. Changes to any requirement must go through a</p><p>formal change request and this SRS must be versioned accordingly.</p>|
| :- |

Page 
