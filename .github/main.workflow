action "deploy" {
  uses = "./deploy/"
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
}

workflow "Deploy" {
  on = "push"
  resolves = ["deploy"]
}
