output "ec2_public_ip" { value = aws_instance.app.public_ip }
output "rds_endpoint" { value = aws_db_instance.postgres.address }
output "ecr_repository_url" { value = aws_ecr_repository.app.repository_url }
output "s3_bucket" { value = aws_s3_bucket.assets.bucket }
