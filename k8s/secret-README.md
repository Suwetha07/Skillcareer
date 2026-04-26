Apply these secrets before running Helm:

kubectl apply -f k8s/dev/secret.yaml
kubectl apply -f k8s/prod/secret.yaml

Then deploy:

helm upgrade --install skillcareer-dev ./k8s/helm/skillcareer -f ./k8s/dev/values.yaml -n dev --create-namespace
helm upgrade --install skillcareer-prod ./k8s/helm/skillcareer -f ./k8s/prod/values.yaml -n prod --create-namespace

Important:
- replace `your-jwt-secret` before applying
- if you do not want secrets in git, keep these files local or use GitHub Actions to create them instead
