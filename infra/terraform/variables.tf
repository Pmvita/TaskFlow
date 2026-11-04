variable "aws_region" { type = string; default = "us-east-1" }
variable "domain_name" { type = string; default = "" }
variable "s3_bucket_name" { type = string; default = "taskflow-assets-unique" }
variable "db_password" { type = string; sensitive = true }
variable "key_name" { type = string; default = "" }
variable "ssh_cidr" { type = string; default = "0.0.0.0/0" }
variable "alert_email" { type = string; default = "" }
