# SkillCareer DevSecOps Platform

SkillCareer is a two-tier microservices application with a React UI, Node.js API services, MongoDB persistence, Docker containerization, Helm-based Kubernetes deployment, and GitHub Actions CI/CD.

## Repository Layout
- `frontend`
- `api-gateway`
- `services/user-service`
- `services/career-service`
- `services/skill-service`
- `services/roadmap-service`
- `services/content-service`
- `services/progress-service`
- `k8s/helm/skillcareer`
- `k8s/dev`
- `k8s/prod`
- `.github/workflows`

## Local Development
1. Install dependencies in each service and app folder with `npm install`.
2. Run the services with `npm start`.
3. Run the frontend locally with `npm run dev`.
4. Or run the full local stack with `docker compose up --build`.

## Docker Hardening
- all application images use multi-stage Dockerfiles
- Node.js containers run as the non-root `node` user
- the frontend is built once and served by unprivileged Nginx
- `.dockerignore` files exclude local artifacts and secrets

## CI/CD and Branch Flow
- `develop` branch deploys to the `dev` namespace
- `main` branch deploys to the `prod` namespace
- GitHub Actions performs SonarQube, Snyk, Trivy, and CodeQL checks
- the deployment workflow builds images with the commit SHA, pushes them, creates Kubernetes secrets, and deploys with Helm

## Secret Management
- real Kubernetes secrets are not committed to the repository
- GitHub Secrets provide `JWT_SECRET`, `MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`, `KUBECONFIG_B64`, `DEV_NFS_SERVER`, and `PROD_NFS_SERVER`
- the deployment workflow creates `skillcareer-secrets` inside the target namespace

## Kubernetes
- `dev` and `prod` namespaces are isolated
- Helm values are split into `k8s/dev/values.yaml` and `k8s/prod/values.yaml`
- readiness and liveness probes use `/health` for backend services
- MongoDB uses a StatefulSet with PVC-backed storage
- each service uses its own Mongo database name

## Verification
- `kubectl get all -n dev`
- `kubectl get all -n prod`
- `kubectl get pvc -n dev`
- `kubectl get pvc -n prod`
- check GitHub Actions logs for SonarQube, Snyk, Trivy, and CodeQL results
