# skillcareer-infra

This repository contains the central Helm, Kubernetes, and CI/CD assets for the SkillCareer microservices platform.

## Included
- `.github/workflows`
- `argocd`
- `helm/skillcareer`
- `k8s/dev`
- `k8s/prod`
- `k8s/secret.yaml`
- `README.md`

## Argo CD Deployment Model
- `argocd/skillcareer-dev-app.yaml` deploys to `dev` namespace using:
  - `helm/skillcareer/values.yaml`
  - `helm/skillcareer/values-dev.yaml`
- `argocd/skillcareer-prod-app.yaml` deploys to `prod` namespace using:
  - `helm/skillcareer/values.yaml`
  - `helm/skillcareer/values-prod.yaml`
- workflow `.github/workflows/argocd-apps.yml` applies/updates the Argo CD Applications
  on changes to Helm or Argo CD manifests.

## Required GitHub Secrets
- `SONAR_TOKEN`
- `SONAR_HOST_URL`
- `SNYK_TOKEN`
- `KUBE_CONFIG`
