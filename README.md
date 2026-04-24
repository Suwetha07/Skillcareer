# Career & Skill Intelligence Platform

A production-grade microservices architecture application with Node.js backend services, React frontend, API gateway, and MongoDB.

## Structure

- /frontend
- /api-gateway
- /services/user-service
- /services/career-service
- /services/skill-service
- /services/roadmap-service
- /services/content-service
- /services/progress-service

## Notes

Each service is an independent Node.js Express app with its own server, routes, models, and MongoDB connection.
Frontend uses React, Tailwind CSS, Context API, Fetch API.

## Startup

1. Install dependencies in each folder:
   - `cd services/user-service && npm install`
   - `cd services/career-service && npm install`
   - `cd services/skill-service && npm install`
   - `cd services/roadmap-service && npm install`
   - `cd services/content-service && npm install`
   - `cd services/progress-service && npm install`
   - `cd api-gateway && npm install`
   - `cd frontend && npm install`
2. Start each microservice and gateway separately:
   - `npm start` in `services/user-service`
   - `npm start` in `services/career-service`
   - `npm start` in `services/skill-service`
   - `npm start` in `services/roadmap-service`
   - `npm start` in `services/content-service`
   - `npm start` in `services/progress-service`
   - `npm start` in `api-gateway`
   - `npm run dev` in `frontend`

## Service Ports

- API Gateway: `5000`
- User Service: `5001`
- Career Service: `5002`
- Skill Service: `5003`
- Roadmap Service: `5004`
- Content Service: `5005`
- Progress Service: `5006`

## Architecture

The API Gateway validates JWT tokens and proxies requests to backend microservices. The frontend communicates only with `/api/*` gateway routes.
