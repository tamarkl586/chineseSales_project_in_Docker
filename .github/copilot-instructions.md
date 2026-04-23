# Copilot Instructions

## Workspace Overview
- Root repo combines a frontend Angular app and a backend ASP.NET Core API.
- Frontend: `client/chineseSale` is an Angular 21 standalone application.
- Backend: `server/project1` is an ASP.NET Core 8 Web API using Entity Framework Core, AutoMapper, JWT auth, and Redis caching.
- Container setup: `docker-compose.yml` runs SQL Edge, Redis, and the .NET app.

## Important Notes
- The frontend has a dedicated project-level Copilot instruction file at `client/chineseSale/.github/copilot-instructions.md`. Use that for Angular-specific guidance.
- The backend is organized into `Controllers`, `BLL`, `DAL`, `DTOs`, `Mapping`, `Models`, and `Migrations`.
- `Program.cs` configures CORS, JWT authentication, database migrations on startup, Serilog, Swagger, and static file serving from `wwwroot`.
- The Dockerfile is a multi-stage build that compiles the Angular frontend first and then publishes the .NET API, copying the Angular `browser` assets into `wwwroot`.

## How to Run
- Local frontend dev: `cd client/chineseSale && npm run start`
- Local backend dev: use .NET CLI from `server/project1`, e.g. `dotnet run` or via the Docker setup.
- Docker setup: `docker-compose up --build`
- The API listens on port `8080` and the Docker environment uses `ConnectionStrings__DefaultConnection` and `Redis_ConnectionString` from `docker-compose.yml`.

## Key Conventions
- Angular uses standalone components and the new `@if` template syntax.
- HTTP services use environment-based `apiUrl` values and JWT bearer auth stored in `localStorage` under `token`.
- The backend uses repository-like DAL interfaces plus BLL services for business logic, with controllers mapping HTTP routes to service calls.
- The API can be explored via Swagger at runtime.

## Where To Look First
- Frontend shell and routing: `client/chineseSale/src/app/app.html`, `client/chineseSale/src/app/app.routes.ts`, `client/chineseSale/src/app/app.ts`
- Angular services: `client/chineseSale/src/app/services/*`
- Backend request flow: `server/project1/Controllers/*`
- Backend DI and startup: `server/project1/Program.cs`
- Database models and EF context: `server/project1/Models/*`, `server/project1/DAL/ProjectContext.cs`

## Best Practices for Copilot
- Prefer using the existing Angular project instructions in `client/chineseSale/.github/copilot-instructions.md` for UI or app logic tasks.
- For feature work, avoid hardcoding secrets or connection strings; use configuration in `docker-compose.yml`, `appsettings.json`, or environment variables.
- Keep any new frontend changes aligned with existing Hebrew UI strings and the current Angular style.
- When modifying backend auth or data access, verify behavior against JWT protection and SQL Server migrations.
