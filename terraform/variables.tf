variable "do_token" {}

variable "region" {}

variable "registry_address" {}

variable "infura_token" {}

variable "port-ssh" {
  default = "22"
}

variable "port-dns" {
  default = "53"
}

variable "port-ipfs" {
  default = "5001"
}

# This allows all outbound to https. Not the best.
variable "port-eth" {
  default = "443"
}

variable "port-pip" {
  default = "3128"
}

variable "public_key_path" {
  default = "/home/user/.ssh/id.pub"
}

variable "private_key_path" {
  default = "/home/user/.ssh/id"
}
