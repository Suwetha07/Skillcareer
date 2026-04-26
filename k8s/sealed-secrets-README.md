# Sealed Secrets for SkillCareer

These files are templates for Bitnami Sealed Secrets:
- `k8s/dev/sealed-secret.yaml`
- `k8s/prod/sealed-secret.yaml`

Prerequisite:
- the Sealed Secrets controller must be installed in the cluster
- `kubeseal` CLI must be available on your machine

## Create plain Secret YAML locally

Dev:

```bash
kubectl create secret generic skillcareer-secrets \
  -n dev \
  --from-literal=MONGO_ROOT_USERNAME=admin \
  --from-literal=MONGO_ROOT_PASSWORD=admin123 \
  --from-literal=JWT_SECRET=your-jwt-secret \
  --from-literal=USER_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.dev.svc.cluster.local:27017/skillcareer-user?authSource=admin' \
  --from-literal=CAREER_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.dev.svc.cluster.local:27017/skillcareer-career?authSource=admin' \
  --from-literal=SKILL_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.dev.svc.cluster.local:27017/skillcareer-skill?authSource=admin' \
  --from-literal=ROADMAP_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.dev.svc.cluster.local:27017/skillcareer-roadmap?authSource=admin' \
  --from-literal=CONTENT_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.dev.svc.cluster.local:27017/skillcareer-content?authSource=admin' \
  --from-literal=PROGRESS_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.dev.svc.cluster.local:27017/skillcareer-progress?authSource=admin' \
  --dry-run=client -o yaml > dev-secret-plain.yaml
```

Prod:

```bash
kubectl create secret generic skillcareer-secrets \
  -n prod \
  --from-literal=MONGO_ROOT_USERNAME=admin \
  --from-literal=MONGO_ROOT_PASSWORD=admin123 \
  --from-literal=JWT_SECRET=your-jwt-secret \
  --from-literal=USER_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.prod.svc.cluster.local:27017/skillcareer-user?authSource=admin' \
  --from-literal=CAREER_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.prod.svc.cluster.local:27017/skillcareer-career?authSource=admin' \
  --from-literal=SKILL_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.prod.svc.cluster.local:27017/skillcareer-skill?authSource=admin' \
  --from-literal=ROADMAP_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.prod.svc.cluster.local:27017/skillcareer-roadmap?authSource=admin' \
  --from-literal=CONTENT_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.prod.svc.cluster.local:27017/skillcareer-content?authSource=admin' \
  --from-literal=PROGRESS_SERVICE_MONGO_URI='mongodb://admin:admin123@mongodb.prod.svc.cluster.local:27017/skillcareer-progress?authSource=admin' \
  --dry-run=client -o yaml > prod-secret-plain.yaml
```

## Seal the secret

```bash
kubeseal --format yaml < dev-secret-plain.yaml > k8s/dev/sealed-secret.yaml
kubeseal --format yaml < prod-secret-plain.yaml > k8s/prod/sealed-secret.yaml
```

## Apply Sealed Secrets

```bash
kubectl apply -f k8s/dev/sealed-secret.yaml
kubectl apply -f k8s/prod/sealed-secret.yaml
```

## Deploy Helm

```bash
helm upgrade --install skillcareer-dev ./k8s/helm/skillcareer -f ./k8s/dev/values.yaml -n dev --create-namespace
helm upgrade --install skillcareer-prod ./k8s/helm/skillcareer -f ./k8s/prod/values.yaml -n prod --create-namespace
```

Notes:
- do not commit `dev-secret-plain.yaml` or `prod-secret-plain.yaml`
- the Helm chart already expects the secret name `skillcareer-secrets`
- once applied, the Sealed Secrets controller will create the normal Kubernetes Secret automatically
