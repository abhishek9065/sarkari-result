# DigitalOcean Deployment Guide

## Prerequisites
- DigitalOcean account
- Domain pointed to Cloudflare (from previous setup)
- SSH key configured

---

## Step 1: Create Droplet

1. Go to [DigitalOcean](https://cloud.digitalocean.com)
2. Create → Droplets
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic $6/mo (1GB RAM) or $12/mo (2GB RAM recommended)
   - **Datacenter**: Choose nearest to your users (Singapore for India)
   - **Authentication**: SSH Key (recommended)

4. Note your Droplet IP address

---

## Step 2: Initial Server Setup

SSH into your server:
```bash
ssh root@YOUR_DROPLET_IP
```

Update system:
```bash
apt update && apt upgrade -y
```

Install Docker:
```bash
curl -fsSL https://get.docker.com | sh
```

Install Docker Compose:
```bash
apt install docker-compose-plugin -y
```

Create non-root user:
```bash
adduser deploy
usermod -aG docker deploy
```

---

## Step 3: Deploy Application

Switch to deploy user:
```bash
su - deploy
```

Clone repository:
```bash
git clone https://github.com/abhishek9065/sarkari-result.git
cd sarkari-result
```

Create environment file:
```bash
cp .env.example .env
nano .env
# Fill in your DATABASE_URL, JWT_SECRET, etc.
```

Build and start containers:
```bash
docker compose up -d --build
```

Check status:
```bash
docker compose ps
docker compose logs -f
```

---

## Step 4: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 5: Update Cloudflare DNS

In Cloudflare Dashboard:
1. Go to DNS settings
2. Update A record:
   - Name: `@`
   - IPv4: `YOUR_DROPLET_IP`
   - Proxy: ✅ Proxied (orange cloud)

---

## Maintenance Commands

### View logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Restart services
```bash
docker compose restart
```

### Update application
```bash
git pull origin main
docker compose up -d --build
```

### View resource usage
```bash
docker stats
```

---

## Troubleshooting

### Check if containers are running
```bash
docker compose ps
```

### Check container health
```bash
docker inspect --format='{{.State.Health.Status}}' sarkari-backend
```

### View nginx access logs
```bash
docker compose exec nginx tail -f /var/log/nginx/access.log
```

---

## Cost Estimate

| Resource | Cost/Month |
|----------|------------|
| Droplet (2GB) | $12 |
| Database (managed) | $15 |
| **Total** | **~$27/month** |

Or use external DB (Neon, Supabase free tier) to save on database costs.
