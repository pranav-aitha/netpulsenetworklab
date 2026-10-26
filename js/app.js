/**
 * NetPulse Network Lab - Main Application Controller
 * Handles UI interactions, live calculations, header grid rendering, and audio integration.
 * Author: Pranav Aitha
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const ipInput = document.getElementById('ip-input');
  const cidrInput = document.getElementById('cidr-input');
  const cidrSlider = document.getElementById('cidr-slider');
  const cidrLabel = document.getElementById('cidr-label');
  const calcError = document.getElementById('calc-error');

  // Result displays
  const resNetmask = document.getElementById('res-netmask');
  const resSubnetId = document.getElementById('res-subnet-id');
  const resBroadcastId = document.getElementById('res-broadcast-id');
  const resUsableHosts = document.getElementById('res-usable-hosts');
  const resHostRange = document.getElementById('res-host-range');
  const resWildcard = document.getElementById('res-wildcard');
  const resTotalHosts = document.getElementById('res-total-hosts');
  const resClass = document.getElementById('res-class');
  const resScope = document.getElementById('res-scope');
  const binaryBitstream = document.getElementById('binary-bitstream');
  const netBitsBadge = document.getElementById('net-bits-badge');
  const hostBitsBadge = document.getElementById('host-bits-badge');

  // IPv4 Header Elements
  const headerGrid = document.getElementById('header-grid');
  const inspectCard = document.getElementById('header-inspect-card');
  const inspectTitle = document.getElementById('inspect-title');
  const inspectBadge = document.getElementById('inspect-badge');
  const inspectBits = document.getElementById('inspect-bits');
  const inspectHex = document.getElementById('inspect-hex');
  const inspectRole = document.getElementById('inspect-role');
  const inspectRouting = document.getElementById('inspect-routing');
  const inspectDefense = document.getElementById('inspect-defense');
  const inspectDefault = document.getElementById('inspect-default');

  // Header Sandbox Controls
  const ttlSlider = document.getElementById('sim-ttl-slider');
  const ttlValDisplay = document.getElementById('sim-ttl-val');
  const ttlSimStatus = document.getElementById('sim-ttl-status');
  const simProtoSelect = document.getElementById('sim-proto-select');
  const simFlagDf = document.getElementById('sim-flag-df');
  const simFlagMf = document.getElementById('sim-flag-mf');

  // Retro Controls
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const crtToggleBtn = document.getElementById('crt-toggle-btn');
  const crtOverlay = document.getElementById('crt-overlay');

  // State
  let activeHeaderFieldId = 'ttl';

  // --- 1. Sound & CRT Toggles ---
  function updateSoundButton() {
    const muted = RetroAudio.isMuted();
    soundToggleBtn.innerHTML = muted 
      ? '<span class="icon">🔇</span> SOUND: OFF' 
      : '<span class="icon">🔊</span> SOUND: ON';
    soundToggleBtn.classList.toggle('active', !muted);
  }

  soundToggleBtn.addEventListener('click', () => {
    RetroAudio.toggleMute();
    updateSoundButton();
  });
  updateSoundButton();

  crtToggleBtn.addEventListener('click', () => {
    const isOff = crtOverlay.classList.toggle('crt-disabled');
    crtToggleBtn.innerHTML = isOff 
      ? '<span class="icon">📺</span> CRT: OFF' 
      : '<span class="icon">📺</span> CRT: ON';
    crtToggleBtn.classList.toggle('active', !isOff);
    RetroAudio.blip();
  });

  // --- 2. Subnet Calculator Logic ---
  function runCalculation() {
    let rawIp = ipInput.value.trim();
    let cidrVal = parseInt(cidrSlider.value, 10);

    // If user entered slash in IP input (e.g. 192.168.1.1/26)
    if (rawIp.includes('/')) {
      const parts = rawIp.split('/');
      rawIp = parts[0].trim();
      const extractedCidr = parseInt(parts[1], 10);
      if (!isNaN(extractedCidr) && extractedCidr >= 0 && extractedCidr <= 32) {
        cidrVal = extractedCidr;
        cidrSlider.value = cidrVal;
        cidrInput.value = cidrVal;
      }
    }

    cidrLabel.textContent = `/${cidrVal}`;

    const res = SubnetEngine.calculate(rawIp, cidrVal);

    if (!res.success) {
      calcError.textContent = `[!] ERROR: ${res.error}`;
      calcError.classList.remove('hidden');
      return;
    }

    calcError.classList.add('hidden');

    // Populate outputs
    resNetmask.textContent = res.netmask;
    resSubnetId.textContent = res.subnetId;
    resBroadcastId.textContent = res.broadcastId;
    resUsableHosts.textContent = res.usableHostCount;
    resHostRange.textContent = res.usableHostRange;
    resWildcard.textContent = res.wildcardMask;
    resTotalHosts.textContent = res.totalHostCount;
    resClass.textContent = res.classType;
    resScope.textContent = res.scope;

    netBitsBadge.textContent = `${res.networkBitsCount} NETWORK BITS`;
    hostBitsBadge.textContent = `${res.hostBitsCount} HOST BITS`;

    // Render 32-bit Binary Visualizer
    renderBinaryStream(res.bitBreakdown);
  }

  function renderBinaryStream(bits) {
    binaryBitstream.innerHTML = '';
    bits.forEach((b, idx) => {
      const bitChip = document.createElement('div');
      bitChip.className = `bit-chip bit-${b.type}`;
      bitChip.textContent = b.bit;
      bitChip.title = `Bit ${idx} (${b.type.toUpperCase()})`;

      binaryBitstream.appendChild(bitChip);

      // Add octet separator dot
      if ((idx + 1) % 8 === 0 && idx < 31) {
        const dot = document.createElement('div');
        dot.className = 'bit-separator';
        dot.textContent = '·';
        binaryBitstream.appendChild(dot);
      }
    });
  }

  // Input Listeners
  ipInput.addEventListener('input', () => {
    runCalculation();
    RetroAudio.blip();
  });

  cidrSlider.addEventListener('input', (e) => {
    cidrInput.value = e.target.value;
    runCalculation();
    RetroAudio.blip();
  });

  cidrInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 24;
    val = Math.max(0, Math.min(32, val));
    cidrSlider.value = val;
    runCalculation();
  });

  // Preset Cartridge Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ip = btn.getAttribute('data-ip');
      const cidr = parseInt(btn.getAttribute('data-cidr'), 10);
      ipInput.value = ip;
      cidrSlider.value = cidr;
      cidrInput.value = cidr;
      runCalculation();
      RetroAudio.preset();
    });
  });

  // Copy Buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
          const original = btn.textContent;
          btn.textContent = 'COPIED!';
          btn.classList.add('copied');
          RetroAudio.calculate();
          setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
          }, 1400);
        });
      }
    });
  });

  // --- 3. IPv4 Header Visualizer Logic ---
  function renderHeaderGrid() {
    headerGrid.innerHTML = '';

    // Group fields by row (0 through 5)
    for (let r = 0; r <= 5; r++) {
      const rowFields = HeaderData.filter(f => f.row === r);
      if (rowFields.length === 0) continue;

      const rowEl = document.createElement('div');
      rowEl.className = 'header-row';
      rowEl.setAttribute('data-row', r);

      const rowLabel = document.createElement('div');
      rowLabel.className = 'row-byte-label';
      rowLabel.textContent = `BYTE ${r * 4} - ${(r * 4) + 3}`;
      rowEl.appendChild(rowLabel);

      const blocksContainer = document.createElement('div');
      blocksContainer.className = 'row-blocks';

      rowFields.forEach(field => {
        const block = document.createElement('div');
        block.className = `header-block block-${field.id}`;
        block.setAttribute('data-field-id', field.id);
        block.style.flex = `${field.bits} 0 0%`;

        // Inner block markup
        block.innerHTML = `
          <div class="block-top">
            <span class="block-name">${field.name}</span>
            <span class="block-bits">${field.bits}b</span>
          </div>
          <div class="block-range">${field.bitRange}</div>
          <div class="block-val" id="val-${field.id}">${field.hexExample}</div>
        `;

        // Hover & Click interactions
        block.addEventListener('mouseenter', () => {
          highlightField(field.id);
          RetroAudio.inspect();
        });

        block.addEventListener('click', () => {
          highlightField(field.id);
          RetroAudio.preset();
        });

        blocksContainer.appendChild(block);
      });

      rowEl.appendChild(blocksContainer);
      headerGrid.appendChild(rowEl);
    }

    // Default selection
    highlightField('ttl');
  }

  function highlightField(fieldId) {
    activeHeaderFieldId = fieldId;
    const field = HeaderData.find(f => f.id === fieldId);
    if (!field) return;

    // Remove active class from all blocks
    document.querySelectorAll('.header-block').forEach(b => {
      b.classList.remove('active');
    });

    // Add active class to current block
    const activeEl = document.querySelector(`.header-block[data-field-id="${fieldId}"]`);
    if (activeEl) {
      activeEl.classList.add('active');
    }

    // Update Inspection Card
    inspectTitle.textContent = field.name.toUpperCase();
    inspectBadge.textContent = field.badge;
    inspectBits.textContent = `${field.bits} BITS (${field.bitRange})`;
    inspectHex.textContent = field.hexExample;
    inspectDefault.textContent = field.defaultValue;
    inspectRole.textContent = field.role;
    inspectRouting.textContent = field.routingInfo;
    inspectDefense.textContent = field.defenseInfo;

    // Animate card ping
    inspectCard.classList.remove('pulse-highlight');
    void inspectCard.offsetWidth; // trigger reflow
    inspectCard.classList.add('pulse-highlight');
  }

  // --- 4. Interactive Packet Header Simulator ---
  function updateHeaderSimulation() {
    const ttl = parseInt(ttlSlider.value, 10);
    ttlValDisplay.textContent = ttl;

    // Update TTL status
    if (ttl === 0) {
      ttlSimStatus.textContent = 'PACKET EXPIRED! ICMP Time Exceeded sent (Loop Defended)';
      ttlSimStatus.className = 'status-dead';
    } else if (ttl === 1) {
      ttlSimStatus.textContent = 'FINAL HOP: Next router will drop packet if not local destination';
      ttlSimStatus.className = 'status-warn';
    } else {
      ttlSimStatus.textContent = `HEALTHY: Can traverse up to ${ttl} router hops across the Internet`;
      ttlSimStatus.className = 'status-ok';
    }

    // Update TTL block display
    const ttlBlockVal = document.getElementById('val-ttl');
    if (ttlBlockVal) {
      ttlBlockVal.textContent = `0x${ttl.toString(16).toUpperCase().padStart(2, '0')} (${ttl})`;
    }

    // Update Protocol block
    const protoVal = simProtoSelect.value;
    const protoHex = protoVal === '6' ? '0x06 (TCP)' : protoVal === '17' ? '0x11 (UDP)' : '0x01 (ICMP)';
    const protoBlockVal = document.getElementById('val-protocol');
    if (protoBlockVal) {
      protoBlockVal.textContent = protoHex;
    }

    // Update Flags block
    const df = simFlagDf.checked ? 1 : 0;
    const mf = simFlagMf.checked ? 1 : 0;
    const flagsBinary = `0${df}${mf}`;
    const flagsBlockVal = document.getElementById('val-flags');
    if (flagsBlockVal) {
      flagsBlockVal.textContent = `0b${flagsBinary} (${df ? 'DF' : ''}${df && mf ? ',' : ''}${mf ? 'MF' : '' || 'None'})`;
    }

    // Update Checksum placeholder
    const checksumBlockVal = document.getElementById('val-checksum');
    if (checksumBlockVal) {
      const fakeSum = ((0x4500 + ttl + parseInt(protoVal, 10) + 0x192) % 0xffff).toString(16).toUpperCase().padStart(4, '0');
      checksumBlockVal.textContent = `0x${fakeSum}`;
    }
  }

  ttlSlider.addEventListener('input', () => {
    updateHeaderSimulation();
    RetroAudio.blip();
  });

  simProtoSelect.addEventListener('change', () => {
    updateHeaderSimulation();
    RetroAudio.calculate();
  });

  simFlagDf.addEventListener('change', () => {
    updateHeaderSimulation();
    RetroAudio.blip();
  });

  simFlagMf.addEventListener('change', () => {
    updateHeaderSimulation();
    RetroAudio.blip();
  });

  // --- 5. Nav Stage Jump Buttons ---
  document.querySelectorAll('.stage-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        RetroAudio.preset();
      }
    });
  });

  // --- Initialization ---
  renderHeaderGrid();
  runCalculation();
  updateHeaderSimulation();
});
