# =============================================================
# Stage 1: Build the Angular frontend
# =============================================================
FROM node:20-alpine AS angular-build

WORKDIR /app/client

# העתקת קבצי הגדרות האנגולר - שימי לב לנתיב המדויק
COPY client/chineseSale/package.json client/chineseSale/package-lock.json ./
RUN npm ci

# בניית האפליקציה
COPY client/chineseSale/ ./
RUN npx ng build --configuration production

# =============================================================
# Stage 2: Build the .NET Web API
# =============================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build

WORKDIR /app/server

# העתקת קובץ הפרויקט - וודאי שזה השם המדויק של ה-csproj
COPY server/project1/project1.csproj ./
RUN dotnet restore

# פרסום השרת
COPY server/project1/ ./
RUN dotnet publish project1.csproj \
        --configuration Release \
        --no-restore \
        --output /app/publish

# =============================================================
# Stage 3: Final runtime image
# =============================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# העתקת השרת המוכן
COPY --from=dotnet-build /app/publish ./

# העתקת קבצי האנגולר לתוך wwwroot של השרת
# שים לב: באנגולר 17 הנתיב בדרך כלל כולל את תיקיית browser
COPY --from=angular-build /app/client/dist/chineseSale/browser ./wwwroot

EXPOSE 8080

ENTRYPOINT ["dotnet", "project1.dll"]



























# # =============================================================
# # Stage 1: Build the Angular frontend
# # =============================================================
# FROM node:20-alpine AS angular-build

# WORKDIR /app/client

# # Install dependencies first (layer-cache friendly)
# COPY client/chineseSale/package.json client/chineseSale/package-lock.json ./
# RUN npm ci

# # Copy the rest of the Angular source and build for production
# COPY client/chineseSale/ ./
# RUN npx ng build --configuration production

# # Output lands in: /app/client/dist/chineseSale/browser


# # =============================================================
# # Stage 2: Build the .NET Web API
# # =============================================================
# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build

# WORKDIR /app/server

# # Restore NuGet packages (layer-cache friendly)
# COPY server/project1/project1.csproj ./
# RUN dotnet restore

# # Copy the rest of the server source and publish
# COPY server/project1/ ./
# RUN dotnet publish project1.csproj \
#         --configuration Release \
#         --no-restore \
#         --output /app/publish


# # =============================================================
# # Stage 3: Final runtime image
# # =============================================================
# FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# WORKDIR /app

# # Copy the published .NET application
# COPY --from=dotnet-build /app/publish ./

# # Copy the Angular dist output into wwwroot so ASP.NET serves it
# COPY --from=angular-build /app/client/dist/chineseSale/browser ./wwwroot

# # ASP.NET Core listens on port 8080 by default in the official image
# EXPOSE 8080

# ENTRYPOINT ["dotnet", "project1.dll"]
