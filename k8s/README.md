# Kubernetes Manifests for SkillCareer

Apply in this order:
1. kubectl apply -f k8s/00-namespaces.yaml
2. kubectl apply -f k8s/01-storageclass.yaml
3. kubectl apply -f k8s/02-configmap-secret.yaml
4. kubectl apply -f k8s/03-mongodb-statefulset.yaml
5. kubectl apply -f k8s/06-services.yaml
6. kubectl apply -f k8s/04-frontend-deployments.yaml
7. kubectl apply -f k8s/05-backend-statefulsets.yaml
8. kubectl apply -f k8s/07-hpa.yaml
9. kubectl apply -f k8s/08-gateway-httproute.yaml

Expected local image names:
- suwetha07/skillcareer-frontend:v1.0.0
- suwetha07/skillcareer-api-gateway:v1.0.0
- suwetha07/skillcareer-user-service:v1.0.0
- suwetha07/skillcareer-career-service:v1.0.0
- suwetha07/skillcareer-skill-service:v1.0.0
- suwetha07/skillcareer-roadmap-service:v1.0.0
- suwetha07/skillcareer-content-service:v1.0.0
- suwetha07/skillcareer-progress-service:v1.0.0

Project ports used here:
- frontend: 5173
- api-gateway: 5000
- user-service: 5001
- career-service: 5002
- skill-service: 5003
- roadmap-service: 5004
- content-service: 5005
- progress-service: 5006

Notes:
- frontend-ui is exposed through the Gateway / route
- API calls are exposed through the Gateway /api route
- backend services are headless because you asked to stay close to the template style
- probes use tcpSocket because the current app does not expose /health endpoints
- imagePullPolicy is IfNotPresent so local-cluster usage is easier
