# CI/CD Templates for SkillCareer

This folder contains GitHub Actions style workflow templates for each microservice.

Included security steps:
- SonarQube scan
- Snyk code and container scan
- Trivy filesystem scan
- Trivy image scan

To use them directly in GitHub Actions, copy these files into `.github/workflows/`.

Required GitHub secrets:
- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN
- SONAR_HOST_URL
- SONAR_TOKEN
- SNYK_TOKEN
