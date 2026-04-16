variable "github_token" {
  description = "GitHub Personal Access Token"
  type        = string
  sensitive   = true
}

variable "github_owner" {
  description = "GitHub User or Organization name"
  type        = string
}

variable "repository_name" {
  description = "The name of the GitHub repository"
  type        = string
}

variable "jwt_secret" {
  description = "The JWT secret to be stored in GitHub Actions secrets"
  type        = string
  sensitive   = true
}
