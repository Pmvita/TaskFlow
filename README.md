# TaskFlow

Task management web app (Node/Express + Postgres + React) deployed end-to-end on AWS.

## Architecture

```mermaid
flowchart TB
  U[User] -->|HTTPS| R53[Route53]
  R53 --> EC2[EC2 t2.micro]
  EC2 -->|Docker| APP[TaskFlow container]
  APP -->|SQL| RDS[(RDS db.t3.micro Postgres)]
  APP -->|files| S3[(S3 bucket)]
  EC2 --> CW[CloudWatch]
  CW --> SNS[SNS email alerts]
  ACM[ACM cert] --> EC2
```

## Cost (~$0-5/mo on free tier)

| Resource | Tier | Cost |
|---|---|---|
| EC2 t2.micro | 750 hrs/mo free | $0 |
| RDS db.t3.micro | 750 hrs/mo free | $0 |
| S3 | 5 GB free | ~$0 |
| Route53 | hosted zone | ~$0.50 |
| CloudWatch/SNS | free tier | $0 |

## Getting started

Local:
```
cp .env.example .env
cd backend && npm install && npm run db:migrate && npm run dev
cd frontend && npm install && npm run dev
```

Or Docker:
```
docker compose up --build
```

## Deploy

1. Configure AWS creds in GitHub secrets.
2. `cd infra/terraform && terraform init && terraform apply`
3. Push to main triggers deploy workflow.

## Security

- IAM least-privilege instance role (ECR pull, S3 scoped, logs)
- Security groups: EC2 80/443/22, RDS only from EC2
- HTTPS via ACM + Route53
- Helmet, CORS

## License

MIT

## Teardown (keep it free)

```bash
cd infra/terraform
terraform destroy
```
Destroys all billable resources. RDS snapshot first if you need data. CloudWatch/SNS alarms are free tier.
