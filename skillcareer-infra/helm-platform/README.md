# helm-platform

This is the real platform Helm chart for SkillCareer.

## Files
- `Chart.yaml`
- `values.yaml`
- `values-dev.yaml`
- `values-prod.yaml`
- `templates/`
  - `_helpers.tpl`
  - `namespace.yaml`
  - `storageclass.yaml`
  - `configmap.yaml`
  - `secret.yaml`
  - `mongodb.yaml`
  - `frontend.yaml`
  - `backends.yaml`
  - `hpa.yaml`
  - `gateway.yaml`

## Usage
Dev:
```bash
helm upgrade --install skillcareer-dev ./helm-platform -f ./helm-platform/values-dev.yaml -n dev --create-namespace
```

Prod:
```bash
helm upgrade --install skillcareer-prod ./helm-platform -f ./helm-platform/values-prod.yaml -n prod --create-namespace
```
