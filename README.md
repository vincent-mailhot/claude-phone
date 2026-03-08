<p align="center">
  <img src="assets/logo.png" alt="Claude Phone" width="200">
</p>

# Claude Phone

Voice interface for Claude Code via SIP/3CX. Call your AI, and your AI can call you.

## What is this?

Claude Phone gives your Claude Code installation a phone number. You can:

- **Inbound**: Call an extension and talk to Claude - run commands, check status, ask questions
- **Outbound**: Your server can call YOU with alerts, then have a conversation about what to do

## Prerequisites

| Requirement | Where to Get It | Notes |
|-------------|-----------------|-------|
| **3CX Cloud Account** | [3cx.com](https://www.3cx.com/) | Free tier works |
| **ElevenLabs API Key** | [elevenlabs.io](https://elevenlabs.io/) | For text-to-speech |
| **OpenAI API Key** | [platform.openai.com](https://platform.openai.com/) | For Whisper speech-to-text |
| **Claude Code CLI** | [claude.ai/code](https://claude.ai/code) | Requires Claude Max subscription |

## Platform Support

| Platform | Status |
|----------|--------|
| **macOS** | Fully supported |
| **Linux** | Fully supported (including Raspberry Pi) |
| **Windows** | Not supported (may work with WSL) |

## Quick Start

### 1. Install

```bash
curl -sSL https://raw.githubusercontent.com/theNetworkChuck/claude-phone/main/install.sh | bash
```

The installer will:
- Check for Node.js 18+, Docker, and git (offers to install if missing)
- Clone the repository to `~/.claude-phone-cli`
- Install dependencies
- Create the `claude-phone` command

### 2. Setup

```bash
claude-phone setup
```

The setup wizard asks what you're installing:

| Type | Use Case | What It Configures |
|------|----------|-------------------|
| **Voice Server** | Pi or dedicated voice box | Docker containers, connects to remote API server |
| **API Server** | Mac/Linux with Claude Code | Just the Claude API wrapper |
| **Both** | All-in-one single machine | Everything on one box |

### 3. Start

```bash
claude-phone start
```

## Step-by-Step Server Setup Guide

Follow these steps to go from zero to a fully working Claude Phone installation.

---

### Step 1 — Gather Accounts & API Keys

Before you start, collect everything you'll need:

| What | Where | Notes |
|------|-------|-------|
| **3CX Cloud account** | [3cx.com](https://www.3cx.com/) | Free tier supports up to 10 simultaneous calls |
| **ElevenLabs API key** | [elevenlabs.io](https://elevenlabs.io/) → Profile → API Keys | Free tier provides ~10k characters/month |
| **OpenAI API key** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Requires billing enabled; Whisper usage is very cheap |
| **Claude Code CLI** | [claude.ai/download](https://claude.ai/download) | Requires a Claude Max subscription |

> **Tip:** Keep a text file open to paste keys into — you'll be prompted for them during setup.

---

### Step 2 — Prepare Your Server

Claude Phone runs on macOS or Linux (including Raspberry Pi). Windows is not supported (WSL may work).

**Minimum requirements:**

| Resource | Minimum |
|----------|---------|
| CPU | 2 cores (ARM or x86) |
| RAM | 1 GB |
| Disk | 10 GB free |
| OS | Ubuntu 20.04+, Debian 11+, macOS 12+, or Raspberry Pi OS |
| Network | Static LAN IP recommended |

**Open the required firewall ports:**

```bash
# SIP signaling
sudo ufw allow 5060/udp
sudo ufw allow 5060/tcp

# RTP audio (must be open or calls will connect but have no audio)
sudo ufw allow 30000:30100/udp

# Voice app HTTP API (optional — only if you need remote access)
sudo ufw allow 3000/tcp
```

---

### Step 3 — Create a 3CX Extension

Claude Phone registers as a SIP extension on your 3CX PBX.

1. Log in to your 3CX admin panel (`https://YOUR_DOMAIN.3cx.us`)
2. Go to **Extensions** → **Add Extension**
3. Fill in:
   - **Extension number** — e.g. `9000` (this is the number you will dial to reach Claude)
   - **First name** — e.g. `Claude`
   - **Last name** — e.g. `Phone`
4. On the **Phone** tab, note the **Auth ID** and set a strong **Password** — you'll need these in Step 5
5. Ensure **SBC** (Session Border Controller) is enabled in 3CX settings
6. Save the extension

---

### Step 4 — Install Claude Phone

Run the one-line installer on your server:

```bash
curl -sSL https://raw.githubusercontent.com/theNetworkChuck/claude-phone/main/install.sh | bash
```

The installer automatically:
- Checks for Node.js 18+, Docker, and git (and offers to install missing tools)
- Clones the repository to `~/.claude-phone-cli`
- Installs Node.js dependencies
- Makes the `claude-phone` command available in your `PATH`

If the `claude-phone` command isn't found after installation, reload your shell:

```bash
source ~/.bashrc   # Linux
# or open a new terminal tab
```

---

### Step 5 — Run the Setup Wizard

```bash
claude-phone setup
```

The wizard walks you through every setting. Here's what each prompt means:

**Installation type:**
- Choose **Both (all-in-one)** if Claude Code is installed on the same machine
- Choose **Voice Server** if you're on a Pi and Claude Code lives on another machine
- Choose **API Server** if this machine only runs the Claude Code wrapper

**SIP / 3CX settings:**

| Prompt | What to Enter |
|--------|--------------|
| SIP Domain | Your 3CX FQDN, e.g. `yourcompany.3cx.us` |
| SIP Registrar | Same as SIP Domain (usually) |
| SIP Extension | The extension number you created, e.g. `9000` |
| SIP Auth ID | The Auth ID from the 3CX extension tab |
| SIP Password | The password you set in Step 3 |
| External IP | Your server's **LAN IP**, e.g. `192.168.1.50` (run `ip addr` to find it) |

**API keys:**

| Prompt | What to Enter |
|--------|--------------|
| ElevenLabs API key | Paste your key from ElevenLabs |
| ElevenLabs Voice ID | Leave blank to use the default, or paste a custom voice ID |
| OpenAI API key | Paste your key from OpenAI |

**API server URL** *(split deployments only)*:
- Enter `http://<API_SERVER_IP>:3333` pointing at the machine running Claude Code

---

### Step 6 — Start Services

```bash
claude-phone start
```

This launches Docker containers for drachtio (SIP) and FreeSWITCH (media), plus the voice-app Node.js process. On a split deployment it also ensures the API server is reachable.

Check that everything came up correctly:

```bash
claude-phone status
```

Healthy output looks like:

```
✓ Docker containers: running
✓ SIP Registration: OK (extension 9000)
✓ Claude API Server: reachable
✓ Voice App: listening on port 3000
```

If anything is yellow or red, run the automated diagnostics:

```bash
claude-phone doctor
```

---

### Step 7 — Make a Test Call

From any phone registered on your 3CX system, dial the extension you created (e.g. **9000**).

You should hear:
1. A brief greeting spoken by Claude
2. A prompt to speak your question or command
3. Claude's voice response

Try asking: *"What's today's date and time?"* or *"Run a quick system health check."*

If the call connects but there is **no audio**, the most common cause is a wrong `EXTERNAL_IP`. Re-run setup and enter your correct LAN IP:

```bash
claude-phone setup
```

See [Troubleshooting](docs/TROUBLESHOOTING.md) for a full list of common issues and fixes.

---

## Deployment Modes

### All-in-One (Single Machine)

Best for: Mac or Linux server that's always on and has Claude Code installed.

```
┌─────────────────────────────────────────────────────────────┐
│  Your Phone                                                  │
│      │                                                       │
│      ↓ Call extension 9000                                  │
│  ┌─────────────┐                                            │
│  │     3CX     │  ← Cloud PBX                               │
│  └──────┬──────┘                                            │
│         │                                                    │
│         ↓                                                    │
│  ┌─────────────────────────────────────────────┐           │
│  │     Single Server (Mac/Linux)                │           │
│  │  ┌───────────┐    ┌───────────────────┐    │           │
│  │  │ voice-app │ ←→ │ claude-api-server │    │           │
│  │  │ (Docker)  │    │ (Claude Code CLI) │    │           │
│  │  └───────────┘    └───────────────────┘    │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

**Setup:**
```bash
claude-phone setup    # Select "Both"
claude-phone start    # Launches Docker + API server
```

### Split Mode (Pi + API Server)

Best for: Dedicated Pi for voice services, Claude running on your main machine.

```
┌─────────────────────────────────────────────────────────────┐
│  Your Phone                                                  │
│      │                                                       │
│      ↓ Call extension 9000                                  │
│  ┌─────────────┐                                            │
│  │     3CX     │  ← Cloud PBX                               │
│  └──────┬──────┘                                            │
│         │                                                    │
│         ↓                                                    │
│  ┌─────────────┐         ┌─────────────────────┐           │
│  │ Raspberry Pi │   ←→   │ Mac/Linux with      │           │
│  │ (voice-app)  │  HTTP  │ Claude Code CLI     │           │
│  └─────────────┘         │ (claude-api-server) │           │
│                          └─────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

**On your Pi (Voice Server):**
```bash
claude-phone setup    # Select "Voice Server", enter API server IP when prompted
claude-phone start    # Launches Docker containers
```

**On your Mac/Linux (API Server):**
```bash
claude-phone api-server    # Starts Claude API wrapper on port 3333
```

Note: On the API server machine, you don't need to run `claude-phone setup` first - the `api-server` command works standalone.

## CLI Commands

| Command | Description |
|---------|-------------|
| `claude-phone setup` | Interactive configuration wizard |
| `claude-phone start` | Start services based on installation type |
| `claude-phone stop` | Stop all services |
| `claude-phone status` | Show service status |
| `claude-phone doctor` | Health check for dependencies and services |
| `claude-phone api-server [--port N]` | Start API server standalone (default: 3333) |
| `claude-phone device add` | Add a new device/extension |
| `claude-phone device list` | List configured devices |
| `claude-phone device remove <name>` | Remove a device |
| `claude-phone logs [service]` | Tail logs (voice-app, drachtio, freeswitch) |
| `claude-phone config show` | Display configuration (secrets redacted) |
| `claude-phone config path` | Show config file location |
| `claude-phone config reset` | Reset configuration |
| `claude-phone backup` | Create configuration backup |
| `claude-phone restore` | Restore from backup |
| `claude-phone update` | Update Claude Phone |
| `claude-phone uninstall` | Complete removal |

## Device Personalities

Each SIP extension can have its own identity with a unique name, voice, and personality prompt:

```bash
claude-phone device add
```

Example devices:
- **Morpheus** (ext 9000) - General assistant
- **Cephanie** (ext 9002) - Storage monitoring bot

## API Endpoints

The voice-app exposes these endpoints on port 3000:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/outbound-call` | Initiate an outbound call |
| GET | `/api/call/:callId` | Get call status |
| GET | `/api/calls` | List active calls |
| POST | `/api/query` | Query a device programmatically |
| GET | `/api/devices` | List configured devices |

See [Outbound API Reference](voice-app/README-OUTBOUND.md) for details.

## Troubleshooting

### Quick Diagnostics

```bash
claude-phone doctor    # Automated health checks
claude-phone status    # Service status
claude-phone logs      # View logs
```

### Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Calls connect but no audio | Wrong external IP | Re-run `claude-phone setup`, verify LAN IP |
| Extension not registering | 3CX SBC not running | Check 3CX admin panel |
| "Sorry, something went wrong" | API server unreachable | Check `claude-phone status` |
| Port conflict on startup | 3CX SBC using port 5060 | Setup auto-detects this; re-run setup |

See [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for more.

## Configuration

Configuration is stored in `~/.claude-phone/config.json` with restricted permissions (chmod 600).

```bash
claude-phone config show    # View config (secrets redacted)
claude-phone config path    # Show file location
```

## Development

```bash
# Run tests
npm test

# Lint
npm run lint
npm run lint:fix
```

## Documentation

- [CLI Reference](cli/README.md) - Detailed CLI documentation
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Outbound API](voice-app/README-OUTBOUND.md) - Outbound calling API reference
- [Deployment](voice-app/DEPLOYMENT.md) - Production deployment guide
- [Claude Code Skill](docs/CLAUDE-CODE-SKILL.md) - Build a "call me" skill for Claude Code

## License

MIT
