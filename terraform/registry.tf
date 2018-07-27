provider "digitalocean" {
  token = "${var.do_token}"
}

resource "digitalocean_tag" "registry" {
  name = "registry"
}

resource "digitalocean_ssh_key" "default" {
  name       = "Registry Terraform"
  public_key = "${file("${var.public_key_path}")}"
}

resource "digitalocean_droplet" "registry" {
  image    = "docker"
  name     = "registry"
  region   = "${var.region}"
  size     = "s-1vcpu-1gb"
  ssh_keys = ["${digitalocean_ssh_key.default.id}"]
  tags     = ["${digitalocean_tag.registry.id}"]

  provisioner "file" {
    source      = "../service"
    destination = "/root/service"

    connection = {
      type        = "ssh"
      user        = "root"
      private_key = "${file("${var.private_key_path}")}"
      agent       = false
    }
  }

  provisioner "remote-exec" {
    # We don't start the docker-compose here, because for some reason it won't succeed unless you do it manually...
    inline = [
      "curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose",
      "chmod +x /usr/local/bin/docker-compose",
      "cd /root",
      "mkdir nginx",
      "mkdir certs",
      "curl https://raw.githubusercontent.com/jwilder/nginx-proxy/master/nginx.tmpl > ./nginx/nginx.tmpl",
      "echo REGISTRY_ADDRESS=${var.registry_address} > .env",
      "echo ETH_URI=https://mainnet.infura.io/v3/${var.infura_token} >> .env",
    ]

    connection = {
      type        = "ssh"
      user        = "root"
      private_key = "${file("${var.private_key_path}")}"
      agent       = false
    }
  }
}

resource "digitalocean_firewall" "registry" {
  name = "registry"

  droplet_ids = ["${digitalocean_droplet.registry.id}"]

  # permit inbound to ssh, 80 & 443 from anywhere
  inbound_rule = [
    {
      protocol         = "tcp"
      port_range       = "${var.port-ssh}"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "80"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "443"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
  ]

  # permit dns, ipfs, and eth outbound everywhere
  outbound_rule = [
    {
      protocol              = "tcp"
      port_range            = "${var.port-ipfs}"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol              = "tcp"
      port_range            = "${var.port-eth}"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol              = "tcp"
      port_range            = "${var.port-pip}"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol              = "tcp"
      port_range            = "${var.port-dns}"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol              = "udp"
      port_range            = "${var.port-dns}"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
  ]
}

resource "digitalocean_floating_ip" "registry" {
  droplet_id = "${digitalocean_droplet.registry.id}"
  region     = "${digitalocean_droplet.registry.region}"
}

resource "digitalocean_record" "registry" {
  domain = "polyswarm.network"
  type   = "A"
  name   = "gamma-registry"
  value  = "${digitalocean_floating_ip.registry.ip_address}"
}

output "ip-registry" {
  value = "${digitalocean_droplet.registry.ipv4_address}"
}

output "floating-registry" {
  value = "${digitalocean_floating_ip.registry.ip_address}"
}
