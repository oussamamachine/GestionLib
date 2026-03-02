# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["LibraryManagement.API.csproj", "./"]
RUN dotnet restore "LibraryManagement.API.csproj"
COPY . .
RUN dotnet build "LibraryManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "LibraryManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "LibraryManagement.API.dll"]
