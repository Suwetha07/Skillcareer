# Kubernetes for SkillCareer

Helm structure:
- `k8s/helm/skillcareer` contains the shared Helm chart
- `k8s/dev/values.yaml` contains dev overrides
- `k8s/prod/values.yaml` contains prod overrides

Helm install:
1. `helm upgrade --install skillcareer-dev ./k8s/helm/skillcareer -f ./k8s/dev/values.yaml -n dev --create-namespace`
2. `helm upgrade --install skillcareer-prod ./k8s/helm/skillcareer -f ./k8s/prod/values.yaml -n prod --create-namespace`

Docker images used:
- suwetha07/skillcareer-frontend:v1.0.0
- suwetha07/skillcareer-api-gateway:v1.0.0
- suwetha07/skillcareer-user-service:v1.0.0
- suwetha07/skillcareer-career-service:v1.0.0
- suwetha07/skillcareer-skill-service:v1.0.0
- suwetha07/skillcareer-roadmap-service:v1.0.0
- suwetha07/skillcareer-content-service:v1.0.0
- suwetha07/skillcareer-progress-service:v1.0.0

Project ports:
- frontend: 5173
- api-gateway: 5000
- user-service: 5001
- career-service: 5002
- skill-service: 5003
- roadmap-service: 5004
- content-service: 5005
- progress-service: 5006

Notes:
- frontend-ui is exposed through the Gateway `/` route
- API Gateway is exposed through `/api`
- direct backend routes are also exposed through the HTTPRoute
- MongoDB uses the `csi-standard` StorageClass
- backend services are created as StatefulSets with a Mongo wait init container
