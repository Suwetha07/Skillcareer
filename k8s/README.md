# Kubernetes for SkillCareer

Helm structure:
- `k8s/helm/skillcareer` contains the shared Helm chart
- `k8s/dev/values.yaml` contains dev overrides
- `k8s/prod/values.yaml` contains prod overrides

Helm install:
1. `helm upgrade --install skillcareer-dev ./k8s/helm/skillcareer -f ./k8s/dev/values.yaml -n dev --create-namespace`
2. `helm upgrade --install skillcareer-prod ./k8s/helm/skillcareer -f ./k8s/prod/values.yaml -n prod --create-namespace`

Important:
- Kubernetes application secrets are not committed in this repo
- `skillcareer-secrets` must be created by CI/CD or manually before deployment
- each service now uses a separate Mongo database name

Mongo databases:
- user-service -> `skillcareer-user`
- career-service -> `skillcareer-career`
- skill-service -> `skillcareer-skill`
- roadmap-service -> `skillcareer-roadmap`
- content-service -> `skillcareer-content`
- progress-service -> `skillcareer-progress`

Docker images used:
- suwetha07/skillcareer-frontend:v1.0.1
- suwetha07/skillcareer-api-gateway:v1.0.1
- suwetha07/skillcareer-user-service:v1.0.1
- suwetha07/skillcareer-career-service:v1.0.1
- suwetha07/skillcareer-skill-service:v1.0.1
- suwetha07/skillcareer-roadmap-service:v1.0.1
- suwetha07/skillcareer-content-service:v1.0.1
- suwetha07/skillcareer-progress-service:v1.0.1

Notes:
- frontend-ui is exposed through the Gateway `/` route
- API Gateway is exposed through `/api`
- all backend services expose `/health` for readiness and liveness probes
- MongoDB uses PVC through the `csi-standard` StorageClass
- GitHub Actions deploys `develop -> dev` and `main -> prod`
