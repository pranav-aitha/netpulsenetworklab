/**
 * NetPulse Network Lab - Subnet Calculation Engine
 * Pure client-side IPv4 subnet math and bitwise utilities.
 * Author: Pranav Aitha
 */

const SubnetEngine = (() => {
  /**
   * Convert dotted-decimal IPv4 string to an unsigned 32-bit integer.
   * @param {string} ipStr - e.g. "192.168.1.1"
   * @returns {number|null} Unsigned 32-bit integer or null if invalid
   */
  function ipToInt(ipStr) {
    if (!ipStr || typeof ipStr !== 'string') return null;
    const octets = ipStr.trim().split('.');
    if (octets.length !== 4) return null;

    let intVal = 0;
    for (let i = 0; i < 4; i++) {
      const part = octets[i].trim();
      if (!/^\d+$/.test(part)) return null;
      const num = parseInt(part, 10);
      if (num < 0 || num > 255) return null;
      intVal = (intVal << 8) | num;
    }
    // Convert to unsigned 32-bit integer
    return intVal >>> 0;
  }

  /**
   * Convert unsigned 32-bit integer to dotted-decimal IPv4 string.
   * @param {number} intVal
   * @returns {string}
   */
  function intToIp(intVal) {
    return [
      (intVal >>> 24) & 255,
      (intVal >>> 16) & 255,
      (intVal >>> 8) & 255,
      intVal & 255
    ].join('.');
  }

  /**
   * Convert unsigned 32-bit integer to formatted 32-bit binary string (with octet spaces).
   * @param {number} intVal
   * @returns {string} e.g. "11000000.10101000.00000001.00000000"
   */
  function intToBinary(intVal) {
    const raw = (intVal >>> 0).toString(2).padStart(32, '0');
    return `${raw.slice(0, 8)}.${raw.slice(8, 16)}.${raw.slice(16, 24)}.${raw.slice(24, 32)}`;
  }

  /**
   * Generate 32-bit netmask integer from CIDR prefix length (0-32).
   * @param {number} cidr
   * @returns {number}
   */
  function cidrToMaskInt(cidr) {
    if (cidr === 0) return 0;
    return (~0 << (32 - cidr)) >>> 0;
  }

  /**
   * Determine IPv4 Address Class and RFC scope.
   * @param {number} firstOctet
   * @param {string} ip
   * @returns {{ classType: string, scope: string, description: string }}
   */
  function classifyIp(firstOctet, ip) {
    let classType = 'Unknown';
    let scope = 'Public Internet';
    let description = 'Standard routable IPv4 address';

    if (firstOctet >= 1 && firstOctet <= 126) {
      classType = 'Class A';
    } else if (firstOctet === 127) {
      classType = 'Class A (Loopback)';
      scope = 'Host Loopback';
      description = 'Reserved for localhost communication (RFC 1122)';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
      classType = 'Class B';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
      classType = 'Class C';
    } else if (firstOctet >= 224 && firstOctet <= 239) {
      classType = 'Class D (Multicast)';
      scope = 'Multicast';
      description = 'Reserved for multicast groups (RFC 5771)';
    } else if (firstOctet >= 240 && firstOctet <= 255) {
      classType = 'Class E (Experimental)';
      scope = 'Reserved';
      description = 'Reserved for future research and broadcast';
    }

    // RFC 1918 Private Ranges check
    const ipInt = ipToInt(ip);
    if (ipInt !== null) {
      // 10.0.0.0/8
      if ((ipInt & 0xff000000) >>> 0 === 0x0a000000) {
        scope = 'Private (RFC 1918)';
        description = 'Non-routable internal network';
      }
      // 172.16.0.0/12
      else if ((ipInt & 0xfff00000) >>> 0 === 0xac100000) {
        scope = 'Private (RFC 1918)';
        description = 'Non-routable internal network';
      }
      // 192.168.0.0/16
      else if ((ipInt & 0xffff0000) >>> 0 === 0xc0a80000) {
        scope = 'Private (RFC 1918)';
        description = 'Home & small business LAN';
      }
      // 169.254.0.0/16 Link-Local
      else if ((ipInt & 0xffff0000) >>> 0 === 0xa9fe0000) {
        scope = 'Link-Local (APIPA)';
        description = 'Auto-assigned when DHCP fails';
      }
      // 100.64.0.0/10 CGNAT
      else if ((ipInt & 0xffc00000) >>> 0 === 0x64400000) {
        scope = 'Shared / CGNAT (RFC 6598)';
        description = 'Carrier-Grade NAT address space';
      }
    }

    return { classType, scope, description };
  }

  /**
   * Main Subnet Calculator function.
   * Given an IP string and CIDR prefix (0-32), returns exhaustive network details.
   * @param {string} ipInput
   * @param {number|string} cidrInput
   * @returns {Object} Calculated subnet details or error
   */
  function calculate(ipInput, cidrInput) {
    if (!ipInput) {
      return { success: false, error: 'Please enter an IPv4 address' };
    }

    // Check if user entered combined IP/CIDR (e.g. 192.168.1.1/26)
    let rawIp = ipInput.trim();
    let rawCidr = cidrInput;

    if (rawIp.includes('/')) {
      const parts = rawIp.split('/');
      rawIp = parts[0].trim();
      rawCidr = parts[1].trim();
    }

    const ipInt = ipToInt(rawIp);
    if (ipInt === null) {
      return { success: false, error: 'Invalid IPv4 address format (e.g., 192.168.1.1)' };
    }

    let cidr = parseInt(rawCidr, 10);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return { success: false, error: 'CIDR prefix must be between /0 and /32' };
    }

    const maskInt = cidrToMaskInt(cidr);
    const wildcardInt = (~maskInt) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidr);
    let usableHosts = 0;
    let firstHostInt = 0;
    let lastHostInt = 0;

    if (cidr === 32) {
      // Single host route / loopback
      usableHosts = 1;
      firstHostInt = networkInt;
      lastHostInt = networkInt;
    } else if (cidr === 31) {
      // RFC 3021 Point-to-Point Links (both addresses are usable hosts)
      usableHosts = 2;
      firstHostInt = networkInt;
      lastHostInt = broadcastInt;
    } else if (cidr === 0) {
      usableHosts = Math.max(0, totalHosts - 2);
      firstHostInt = 1;
      lastHostInt = 0xfffffffe >>> 0;
    } else {
      usableHosts = totalHosts - 2;
      firstHostInt = networkInt + 1;
      lastHostInt = broadcastInt - 1;
    }

    const firstOctet = (ipInt >>> 24) & 255;
    const classification = classifyIp(firstOctet, rawIp);

    // Generate individual 32-bit array for visual bit display
    const rawBits = (ipInt >>> 0).toString(2).padStart(32, '0');
    const bitBreakdown = [];
    for (let i = 0; i < 32; i++) {
      bitBreakdown.push({
        index: i,
        bit: rawBits[i],
        type: i < cidr ? 'network' : 'host',
        octetIndex: Math.floor(i / 8)
      });
    }

    return {
      success: true,
      input: {
        ip: rawIp,
        cidr: cidr
      },
      netmask: intToIp(maskInt),
      netmaskBinary: intToBinary(maskInt),
      subnetId: intToIp(networkInt),
      subnetIdBinary: intToBinary(networkInt),
      broadcastId: intToIp(broadcastInt),
      broadcastIdBinary: intToBinary(broadcastInt),
      firstUsableHost: intToIp(firstHostInt),
      lastUsableHost: intToIp(lastHostInt),
      usableHostRange: `${intToIp(firstHostInt)} — ${intToIp(lastHostInt)}`,
      usableHostCount: usableHosts.toLocaleString(),
      totalHostCount: totalHosts.toLocaleString(),
      wildcardMask: intToIp(wildcardInt),
      ipBinary: intToBinary(ipInt),
      classType: classification.classType,
      scope: classification.scope,
      scopeDesc: classification.description,
      bitBreakdown: bitBreakdown,
      networkBitsCount: cidr,
      hostBitsCount: 32 - cidr
    };
  }

  return {
    calculate,
    ipToInt,
    intToIp,
    intToBinary
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubnetEngine;
}
