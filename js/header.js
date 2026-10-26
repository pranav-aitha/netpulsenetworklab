/**
 * NetPulse Network Lab - IPv4 Header Visualizer Engine
 * Interactive 32-bit grid map and network defense inspection.
 * Author: Pranav Aitha
 */

const HeaderData = [
  // --- ROW 0 (Bits 0 - 31) ---
  {
    id: 'version',
    name: 'Version',
    row: 0,
    bits: 4,
    bitRange: '0 - 3',
    widthRatio: 4 / 32,
    defaultValue: '4 (0b0100)',
    hexExample: '0x4',
    badge: 'PROTOCOL CORE',
    role: 'Identifies the Internet Protocol revision governing this packet.',
    routingInfo: 'Routers verify this field first. If it is not 4, the IPv4 stack immediately hands it off or drops it if unsupported.',
    defenseInfo: 'Prevents protocol version mismatch attacks. Firewalls inspect this byte to prevent malformed or spoofed IPv6/hybrid encapsulation tunneling without authorization.'
  },
  {
    id: 'ihl',
    name: 'IHL (Header Length)',
    row: 0,
    bits: 4,
    bitRange: '4 - 7',
    widthRatio: 4 / 32,
    defaultValue: '5 (20 bytes)',
    hexExample: '0x5',
    badge: 'BOUNDARY DEFENSE',
    role: 'Internet Header Length specifies the header size in 32-bit (4-byte) words. Minimum is 5 (20 bytes); maximum is 15 (60 bytes).',
    routingInfo: 'Tells the routing engine exactly where the IPv4 header ends and where the higher-layer payload (TCP/UDP) begins.',
    defenseInfo: 'Defends against buffer overflow and packet injection. Packets with IHL < 5 are invalid and dropped immediately. Malformed IHL values historically attempted to bypass legacy deep-packet inspection firewalls.'
  },
  {
    id: 'dscp_ecn',
    name: 'DSCP / ECN (ToS)',
    row: 0,
    bits: 8,
    bitRange: '8 - 15',
    widthRatio: 8 / 32,
    defaultValue: '0x00 (Best Effort)',
    hexExample: '0x00',
    badge: 'QOS & CONGESTION',
    role: 'DSCP (6 bits) classifies traffic for Quality of Service. ECN (2 bits) provides Explicit Congestion Notification.',
    routingInfo: 'DSCP prioritizes mission-critical traffic (e.g., VoIP, BGP keepalives) over bulk traffic. ECN allows intermediate routers to signal bottleneck congestion without dropping packets.',
    defenseInfo: 'Protects network availability during bandwidth saturation. Helps mitigate bufferbloat and enables routers to selectively drop low-priority traffic during volumetric DDoS floods while preserving vital control traffic.'
  },
  {
    id: 'total_length',
    name: 'Total Length',
    row: 0,
    bits: 16,
    bitRange: '16 - 31',
    widthRatio: 16 / 32,
    defaultValue: '1500 bytes (MTU)',
    hexExample: '0x05DC',
    badge: 'BUFFER INTEGRITY',
    role: 'Specifies the total datagram size in bytes, including IPv4 header and upper-layer data. Maximum value is 65,535 bytes.',
    routingInfo: 'Determines the buffer allocation needed in router memory and dictates whether the packet must be fragmented across smaller MTU links.',
    defenseInfo: 'Directly defends against the famous "Ping of Death" exploit, where malformed fragmented packets reassembled into sizes > 65,535 bytes to crash OS network stacks. Modern kernels drop oversized frames automatically.'
  },

  // --- ROW 1 (Bits 32 - 63) ---
  {
    id: 'identification',
    name: 'Identification',
    row: 1,
    bits: 16,
    bitRange: '32 - 47',
    widthRatio: 16 / 32,
    defaultValue: '0x4F2A (Random)',
    hexExample: '0x4F2A',
    badge: 'DATAGRAM ID',
    role: 'A unique 16-bit number assigned by the sender to identify all fragments belonging to a single original datagram.',
    routingInfo: 'Intermediate routers preserve this ID when fragmenting packets. The destination host groups incoming fragments by (Source IP, Destination IP, Protocol, Identification).',
    defenseInfo: 'Modern operating systems randomize this ID to defend against IP ID prediction attacks, idle port scanning (nmap zombie scan), and DNS cache poisoning via spoofed response injection.'
  },
  {
    id: 'flags',
    name: 'Flags (R, DF, MF)',
    row: 1,
    bits: 3,
    bitRange: '48 - 50',
    widthRatio: 3 / 32,
    defaultValue: '010 (DF = 1)',
    hexExample: '0x2',
    badge: 'FRAGMENT CONTROL',
    role: '3 single-bit control flags: Bit 0 = Reserved (0), Bit 1 = DF (Don\'t Fragment), Bit 2 = MF (More Fragments).',
    routingInfo: 'If DF = 1 and packet exceeds the next-hop MTU, router drops the packet and responds with ICMP Type 3 Code 4 ("Fragmentation Needed"), driving Path MTU Discovery (PMTUD).',
    defenseInfo: 'Protects systems against fragmentation attacks (e.g., Teardrop, Bonk, Jolt2, and overlapping fragment evasion). Firewalls often drop packets with abnormal flag combinations (e.g., DF=1 and MF=1 simultaneously).'
  },
  {
    id: 'fragment_offset',
    name: 'Fragment Offset',
    row: 1,
    bits: 13,
    bitRange: '51 - 63',
    widthRatio: 13 / 32,
    defaultValue: '0 (No offset)',
    hexExample: '0x0000',
    badge: 'ASSEMBLY POINTER',
    role: 'Specifies the data offset of this fragment relative to the start of the original unfragmented payload, in units of 8-byte blocks.',
    routingInfo: 'Allows the receiving host to stitch fragmented chunks together into the exact original sequence even if they arrive out of order.',
    defenseInfo: 'Guards against Overlapping Fragment attacks where an attacker crafts overlapping offsets to overwrite TCP port numbers or bypass stateless packet filters. Modern firewalls reassemble or strictly validate offsets before forwarding.'
  },

  // --- ROW 2 (Bits 64 - 95) ---
  {
    id: 'ttl',
    name: 'TTL (Time to Live)',
    row: 2,
    bits: 8,
    bitRange: '64 - 71',
    widthRatio: 8 / 32,
    defaultValue: '64 (Linux) / 128 (Win)',
    hexExample: '0x40',
    badge: 'LOOP TERMINATOR',
    role: 'A hop counter decremented by 1 at every L3 router hop. When TTL reaches 0, the packet is discarded.',
    routingInfo: 'Primary routing loop killer. During dynamic routing convergence (e.g. OSPF/BGP flapping), packets caught in loops are dropped once TTL reaches 0, returning an ICMP Time Exceeded (Type 11) to the sender.',
    defenseInfo: 'Critical defense against endless routing loops and packet storm meltdown. Also serves as the foundation for the traceroute utility and enables OS fingerprinting detection. Protects against BGP route poisoning storms.'
  },
  {
    id: 'protocol',
    name: 'Protocol',
    row: 2,
    bits: 8,
    bitRange: '72 - 79',
    widthRatio: 8 / 32,
    defaultValue: '6 (TCP) / 17 (UDP)',
    hexExample: '0x06',
    badge: 'PAYLOAD DEMUX',
    role: 'Defines the upper-layer transport protocol contained within the payload: 6 = TCP, 17 = UDP, 1 = ICMP, 89 = OSPF, 50 = ESP.',
    routingInfo: 'Demultiplexes the packet at the destination node, dispatching the data payload to the correct kernel transport handler.',
    defenseInfo: 'The cornerstone of Layer 4 firewall Access Control Lists (ACLs). Security appliances inspect this byte to permit or block unauthorized protocols, preventing covert tunnels and malicious command-and-control backdoors.'
  },
  {
    id: 'checksum',
    name: 'Header Checksum',
    row: 2,
    bits: 16,
    bitRange: '80 - 95',
    widthRatio: 16 / 32,
    defaultValue: '0xB743 (Dynamic)',
    hexExample: '0xB743',
    badge: 'INTEGRITY SHIELD',
    role: 'A 16-bit one\'s complement checksum calculated strictly across all fields of the IPv4 header.',
    routingInfo: 'Must be re-computed and verified at EVERY router along the path because the TTL field decrements at each hop.',
    defenseInfo: 'Protects the entire network fabric from corrupted packets caused by faulty NICs, bitflips, or damaged cables. If the checksum fails, the router silently drops the packet, preventing routing misdirection or garbled delivery.'
  },

  // --- ROW 3 (Bits 96 - 127) ---
  {
    id: 'source_ip',
    name: 'Source IP Address',
    row: 3,
    bits: 32,
    bitRange: '96 - 127',
    widthRatio: 32 / 32,
    defaultValue: '192.168.1.50',
    hexExample: '0xC0A80132',
    badge: 'ORIGIN IDENTITY',
    role: 'The 32-bit IPv4 address of the sender that originated the packet.',
    routingInfo: 'Allows the recipient or intermediate proxies to return response packets. Also used in policy-based routing (PBR) and NAT source translation.',
    defenseInfo: 'Key target for Unicast Reverse Path Forwarding (uRPF) and BCP 38 egress filtering to prevent IP Spoofing and reflected DDoS amplification attacks (NTP/DNS). Firewalls cross-check this against known hostile threat intelligence lists.'
  },

  // --- ROW 4 (Bits 128 - 159) ---
  {
    id: 'dest_ip',
    name: 'Destination IP Address',
    row: 4,
    bits: 32,
    bitRange: '128 - 159',
    widthRatio: 32 / 32,
    defaultValue: '1.1.1.1 (Cloudflare)',
    hexExample: '0x01010101',
    badge: 'TARGET ROUTING KEY',
    role: 'The 32-bit IPv4 address of the ultimate intended recipient node.',
    routingInfo: 'The core key evaluated by router Forwarding Information Bases (FIB). Routers perform Longest Prefix Match (LPM) on this address to select the outbound interface and next-hop gateway.',
    defenseInfo: 'Used by stateful firewalls, intrusion detection systems (IDS), and DNAT rules. Protects internal enclaves by restricting traffic solely to approved destination subnets and demilitarized zones (DMZ).'
  },

  // --- ROW 5 (Bits 160+) ---
  {
    id: 'options',
    name: 'Options & Padding (Optional)',
    row: 5,
    bits: 32,
    bitRange: '160 - 191+ (Variable)',
    widthRatio: 32 / 32,
    defaultValue: 'None (Padding to 32-bit word)',
    hexExample: '0x00000000',
    badge: 'DIAGNOSTIC / EXTENSION',
    role: 'Optional variable-length fields for testing, debugging, and special routing (Record Route, Timestamp, Strict/Loose Source Route). Padded with zeros to guarantee 32-bit boundary.',
    routingInfo: 'Rarely used in modern standard internet traffic. Packets with options often experience software slow-path processing in router hardware.',
    defenseInfo: 'Source Routing options are frequently blocked and stripped by enterprise edge routers and firewalls because attackers can abuse Loose Source Routing to bypass network boundaries and perimeter defenses.'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderData;
}
