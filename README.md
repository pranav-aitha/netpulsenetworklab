# 🕹️ NetPulse Network Lab

> **A retro-styled, arcade-themed client-side networking laboratory for mastering IPv4 subnet calculations and packet header architecture.**

[![License: MIT](https://img.shields.io/badge/License-MIT-00f5d4.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-Pure-ff2a85.svg)](#)
[![CSS3](https://img.shields.io/badge/CSS3-Retro%20Arcade-39ff14.svg)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%20Modular-ffbe0b.svg)](#)

---

## 🌐 Live Demo & Deployment

The web application is live and hosted directly via GitHub Pages:

🔗 **[https://pranav-aitha.github.io/netpulsenetworklab/](https://pranav-aitha.github.io/netpulsenetworklab/)**

---

## 💡 Why NetPulse?

When studying computer networking, two fundamental concepts often feel abstract:
1. **Subnetting arithmetic:** Converting dotted-decimal masks to CIDR notations, calculating broadcast boundaries, and counting usable host allocations.
2. **IPv4 datagram structures:** Understanding what each 32-bit row of an IP packet actually does, how fields like TTL prevent infinite network loops, and how flags defend systems against fragmentation attacks.

**NetPulse Network Lab** packages both into an interactive, 80s/90s arcade terminal. It features instant calculations, real-time bit visualizations, interactive packet simulators, and optional chiptune audio synthesizer effects—all running 100% offline in client-side JavaScript.

---

## ⚡ Key Features

### 1. Level 01: Subnet Calculator
Enter any IPv4 address and CIDR prefix (from `/0` to `/32`), or choose one of the quick cartridge presets:
- **Instant Bitmask Math:** Computes the Netmask, Subnet ID (Network Address), Broadcast ID, and Wildcard Mask on every keystroke.
- **Host Capacity Breakdown:** Accurately calculates total address space, usable host range (First Usable & Last Usable host), and usable node count.
- **Standards & Edge Case Compliance:**
  - Handles `/31` point-to-point links per RFC 3021 (2 usable addresses).
  - Handles `/32` host routes (1 address).
  - Categorizes address classes (Class A, B, C, D Multicast, E Reserved).
  - Detects RFC 1918 Private ranges, RFC 1122 Loopback, and RFC 6598 CGNAT address spaces.
- **32-Bit Binary Visualizer:** Renders all 32 individual bits dynamically. Network bits glow in neon cyan, while Host bits glow in amber, complete with octet boundaries and interactive hover tags.
- **One-Click Clipboard Copying:** Copy any calculated address or mask straight to your clipboard with feedback.

### 2. Level 02: Interactive IPv4 Header Visualizer
A pixel-accurate, 32-bit wide grid layout of an IPv4 datagram:
- **Proportional Bit-Width Grid:** Displays Version (4b), IHL (4b), DSCP/ECN (8b), Total Length (16b), Identification (16b), Flags (3b), Fragment Offset (13b), TTL (8b), Protocol (8b), Header Checksum (16b), Source IP (32b), Destination IP (32b), and Options/Padding.
- **Diagnostic Inspection HUD:** Hover over or click any field to open the retro diagnostics monitor:
  - **Bit Allocation:** Bit range, width in bits and bytes.
  - **Primary Role:** What the field signifies to networking hardware.
  - **Routing Function:** How L3 routers read and modify the field during forwarding.
  - **Cyber Defense & Security Context:** How the field defends against network loops, DDoS amplification, ping of death exploits, IP spoofing (uRPF), and fragmentation attacks.

### 3. Level 03: Live Packet Sandbox Simulator
An interactive datagram laboratory where you can manipulate live packet fields:
- **TTL Hop Decrementer:** Slide the hop counter between 0 and 255. Experience how routers trigger the ICMP *Time Exceeded* loop defense when TTL hits 0.
- **Protocol Demultiplexer:** Switch between TCP (`0x06`), UDP (`0x11`), and ICMP (`0x01`) and watch the packet header update its payload identification in real time.
- **Fragmentation Flags:** Toggle the DF (*Don't Fragment*) and MF (*More Fragments*) bits to inspect MTU discovery behavior.

### 4. Retro Arcade Immersion
- **Synth Chiptune Audio:** Pure Web Audio API synthesizers provide retro clicks, calculation chimes, and inspection beeps without downloading any external audio files. Includes an instant sound mute/unmute toggle.
- **CRT Scanline Overlay:** Nostalgic arcade monitor scanlines with a quick toggle to disable if you prefer a modern flat view.
- **Mobile-Responsive:** Automatically rearranges into clean touch-friendly cards on smartphones and tablets.

---

## 📐 IPv4 Header Reference Map

For quick reference, the IPv4 datagram consists of 32-bit (4-byte) horizontal words:

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |   DSCP    |ECN|          Total Length         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|     Fragment Offset     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |        Header Checksum        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source IP Address                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination IP Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options & Padding (Optional)               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 📁 Repository Structure

```
netpulsenetworklab/
├── index.html          # Semantic single-page application structure & UI layout
├── css/
│   └── style.css       # Retro arcade styles, neon glows, CRT simulation & responsive design
├── js/
│   ├── subnet.js       # Pure subnet arithmetic engine (bit shifting, CIDR math, scopes)
│   ├── header.js       # Complete IPv4 header data dictionary, routing & security info
│   ├── audio.js        # Web Audio API 8-bit synthesizer for arcade sound effects
│   └── app.js          # DOM coordinator, event listeners, sandbox simulations
├── .gitignore          # Clean Git ignore rules for editors, OS and cache files
├── LICENSE             # Open-source MIT License
└── README.md           # Documentation, guide, and reference
```

---

## 🚀 Running Locally

No npm, build steps, or package installations are required! NetPulse is built with vanilla web technologies.

### Option A: Direct Open
Simply double-click `index.html` or open it in any modern browser (Chrome, Firefox, Safari, Edge).

### Option B: Local Static Server
If you prefer running via a local server (recommended for audio context policies):

**Using Python 3:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using Node.js (`npx serve`):**
```bash
npx serve .
```

---

## 🛠️ Tech Stack & Architecture

- **Markup:** Semantic HTML5 with accessibility attributes (`aria-label`, `role="alert"`).
- **Styling:** Modern CSS3 featuring Flexbox, CSS Grid, Custom Properties (variables), and scanline effects.
- **Logic:** Vanilla ES6+ JavaScript designed modularly:
  - `SubnetEngine` exposes pure functions (`calculate`, `ipToInt`, `intToIp`).
  - `HeaderData` provides an extensible protocol dictionary.
  - `RetroAudio` encapsulates Web Audio API oscillator synthesis.
  - `app.js` handles DOM bindings and sandbox interactions.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, study, and adapt it for learning or development. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author & Connect

**Made with ❤️ by Pranav Aitha**

Feel free to connect or follow my work:
- 🐦 **X (formerly Twitter):** [@PRANAV_AITHA](https://x.com/PRANAV_AITHA)
- 🐙 **GitHub:** [@pranav-aitha](https://github.com/pranav-aitha)
- 📸 **Instagram:** [@pranav_aitha](https://instagram.com/pranav_aitha)

---

*If you found this tool helpful for your CCNA, Network+, or networking studies, feel free to give the repo a ⭐ on GitHub!*
