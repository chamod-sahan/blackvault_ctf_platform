terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  token = var.github_token
  owner = var.github_owner
}

resource "github_actions_secret" "jwt_secret" {
  repository      = var.repository_name
  secret_name     = "JWT_SECRET"
  plaintext_value = var.jwt_secret
}

resource "github_branch_protection" "main" {
  repository_id = var.repository_name
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = ["frontend", "backend"] # Matches CI job names
  }

  required_pull_request_reviews {
    dismiss_stale_reviews = true
    required_approving_review_count = 1
  }

  enforce_admins = true
}
