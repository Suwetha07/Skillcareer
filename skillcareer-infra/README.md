# skillcareer-infra

This repository contains the central Helm, Kubernetes, and CI/CD assets for the SkillCareer microservices platform.

## Included
- `.github/workflows`
- `helm/skillcareer`
- `k8s/dev`
- `k8s/prod`
- `k8s/secret.yaml`
- `README.md`

## Notes
- plain Kubernetes secret manifests are used
- sealed secrets have been removed from this repo
- deploy dev with `k8s/dev/values.yaml`
- deploy prod with `k8s/prod/values.yaml`

## Required GitHub Secrets
- `SONAR_TOKEN`
- `SONAR_HOST_URL`
- `SNYK_TOKEN`
- `KUBE_CONFIG`
