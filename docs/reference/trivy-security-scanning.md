# Security scanning with Trivy

* https://github.com/aquasecurity/trivy
* https://trivy.dev/
* https://trivy.dev/docs/latest/guide/

## 7 rules to improve trivy usefulness

https://medium.com/@DynamoDevOps/trivy-is-noise-by-default-heres-the-seven-rule-filter-that-catches-real-risk-05c4c3249c26

1. [x] Ignore vulnerabilities that don't have a fix yet (`--ignore-unfixed`)
2. [x] Only fail pipeline on `HIGH,CRITICAL` vulnerabilities
3. [x] Use multistage builds for less noise with slim images
4. [x] Use `.trivyignore` to suppress known, accepted risks
5. [x] Limit scan scope (we only scan built image)
6. [ ] Scan SBOMs instead of full images (faster, more consistent. use syft to generate SBOM in SPDX format.)
7. [x] Output to JSON and then further process the results, e.g. with jq or a custom script.

## Commands

Run scan:
```shell
# uses trivy.yaml, outputs json report. Same as what github actions does.
trivy image ghcr.io/desering/volunteer-scheduler:dev
```

Generate table report:
```shell
trivy convert --scanners vuln,misconfig,secret,license --format table --table-mode detailed --output trivy-detail-table.txt trivy-result.json
```

Fail if `HIGH,CRITICAL` vulnerabilities are found:
```shell
trivy convert --exit-code 1 trivy-result.json
```
