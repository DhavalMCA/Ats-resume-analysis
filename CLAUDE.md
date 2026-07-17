# Security Rules for AI-Generated Apps

This project enforces strict security guidelines for AI coding assistants and developers. All AI tools and code changes MUST adhere to these rules.

---

## 1. Secrets and Environment Variables
- **Never expose secrets in frontend code.** All API keys, database URLs, and private configs live in `.env` files.
- `.env`, `.env.local`, and `.env.*.local` MUST always be listed in `.gitignore`.
- Only variables prefixed with `VITE_` or `NEXT_PUBLIC_` belong in frontend code, and those must NEVER contain secret keys (except public/publishable tokens).
- Create a `.env.example` file with required variable names and empty or placeholder values.

## 2. Rate Limiting
- Apply rate limiting on all public API routes:
  - Auth endpoints: 5 requests / 15 minutes per IP.
  - General API: 60 requests / minute per IP.
  - AI / LLM proxy endpoints: 10 requests / minute per user.
  - File uploads: 5 requests / minute per IP.
- Return `429 Too Many Requests` with `Retry-After` headers. Show clear messages to users when limits are hit.

## 3. Input Validation and Sanitization
- Validate and sanitize all inputs on the server / API boundary using schemas (e.g. Zod, Joi, Pydantic).
- Use parameterized queries or ORMs. Never concatenate user input into SQL/NoSQL queries.
- Validate data types, lengths, allowed characters, enum values, and file size/MIME types.

## 4. Authentication and Authorization
- Use established auth libraries (NextAuth, Clerk, Supabase Auth, Auth0, etc.). Never roll custom auth from scratch.
- Passwords must be hashed with bcrypt (min cost 12) or argon2.
- JWTs must be signed with strong secrets (min 32 chars) and have short expiry (15-60 mins).
- Refresh tokens in httpOnly cookies, not localStorage.
- Perform explicit ownership and role checks on every sensitive operation.

## 5. SQL and Database Security
- Always use an ORM (Prisma, Drizzle, Mongoose, SQLAlchemy) or parameterized queries.
- Apply least privilege to database users.
- Never return raw database error messages or internal schemas to clients.

## 6. CORS Configuration
- Never use wildcard CORS (`*`) in production.
- Explicitly whitelist trusted origins and restrict allowed HTTP methods.

## 7. HTTP Security Headers
- Set security headers using `helmet` or platform configs: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`.
- Disable `X-Powered-By` headers.

## 8. File Upload Security
- Server-side / strict MIME type and extension validation.
- Enforce file size limits (e.g. 5MB images, 10MB/25MB documents).
- Store uploads outside web root or in cloud storage (S3/GCS). Rename uploaded files to UUIDs.

## 9. Error Handling and Logging
- Return generic error messages to clients ("Something went wrong").
- Log full context server-side with sanitized inputs and timestamps.
- Use proper HTTP status codes (4xx client error, 5xx server error).

## 10. Dependency Security
- Audit dependencies (`npm audit` / `pip-audit`) regularly and fix high/critical vulnerabilities.
- Pin dependency versions in production using lockfiles (`package-lock.json`).

## 11. XSS Prevention
- Never render untrusted user content as raw HTML (`dangerouslySetInnerHTML`, `innerHTML`, `eval()`).
- Use DOMPurify if HTML rendering is required.

## 12. Deployment Checklist
- `.env` not in git; secrets configured in hosting platform.
- Debug mode disabled; HTTPS enforced; rate limiting & CORS restricted; database restricted.

## 13. AI and LLM-Specific Rules
- Treat LLM inputs and outputs as untrusted data.
- Sanitize user inputs to prevent prompt injection attacks and cap payload size.
- Set strict `max_tokens` / `maxOutputTokens` on LLM calls to prevent runaway costs.
- Store API keys server-side or handle BYOK securely client-side without logging or leaking keys.
- Validate and parse JSON outputs safely against schemas before using them in application logic.
