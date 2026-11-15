/* SPDX-License-Identifier: GPL-2.0-only. Schematic CNC preview; this is not a controller simulator. */
(function () {
  const state = { graphic: true, legend: false, viewMode: 'auto', showRapid: false, lastData: null };
  const MAX_MOTIONS = 2500;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const finite = value => Number.isFinite(value);
  const format = value => Number.isFinite(value) ? Number(value.toFixed(4)).toString() : '—';

  function detectDialect(text, name) {
    const upper = text.toUpperCase();
    if (/BEGIN\s+PGM|BLK\s+FORM|TOOL\s+CALL|CYCL\s+DEF/.test(upper)) return 'Heidenhain Klartext / TBI';
    if (/\bDEF\s+(REAL|INT|BOOL|STRING)\b|\bSUPA\b|\bTRAORI\b|\.MPF$/i.test(upper + '\n' + name)) return 'Siemens / DMG';
    if (/\bDEF\s+WORK\b|\bCALL\s+OS\d+\b|\bV[A-Z0-9_]*\s*=|\bNCYL\s+G(?:178|181)\b|\bCASCME\b/.test(upper)) return 'Okuma OSP';
    if (/G\s*\d{1,3}|^\s*O\d+/m.test(upper)) return 'ISO / G-code';
    return 'Tekst NC (dialekt nierozpoznany)';
  }

  function evaluateExpression(source, variables) {
    const compact = String(source).replace(/\s+/g, '').toUpperCase();
    const tokens = compact.match(/[A-Z_][A-Z0-9_]*|(?:\d+\.?\d*|\.\d+)|[()+*\/-]/g) || [];
    if (!compact || tokens.join('') !== compact) return null;
    let at = 0;
    function primary() {
      const token = tokens[at++];
      if (token === '+' || token === '-') return (token === '-' ? -1 : 1) * primary();
      if (token === '(') {
        const value = sum();
        if (tokens[at++] !== ')') throw new Error('nawias');
        return value;
      }
      if (/^[A-Z_]/.test(token || '')) {
        if (!(token in variables)) throw new Error('zmienna');
        return variables[token];
      }
      const value = Number(token);
      if (!finite(value)) throw new Error('liczba');
      return value;
    }
    function product() {
      let value = primary();
      while (tokens[at] === '*' || tokens[at] === '/') {
        const operator = tokens[at++], right = primary();
        value = operator === '*' ? value * right : value / right;
        if (!finite(value)) throw new Error('wynik');
      }
      return value;
    }
    function sum() {
      let value = product();
      while (tokens[at] === '+' || tokens[at] === '-') {
        const operator = tokens[at++], right = product();
        value = operator === '+' ? value + right : value - right;
      }
      return value;
    }
    try {
      const value = sum();
      return at === tokens.length && finite(value) ? value : null;
    } catch {
      return null;
    }
  }

  function expandOkuma(lines, warnings) {
    const subprograms = new Map(), hidden = new Set();
    for (let i = 0; i < lines.length; i++) {
      const header = lines[i].code.trim().match(/^(?:N\d+\s+)?(OS\d+)\b/i);
      if (!header) continue;
      let end = i + 1;
      while (end < lines.length && !/^\s*(?:N\d+\s+)?RTS\b/i.test(lines[end].code)) end++;
      if (end === lines.length) {
        warnings.push(`Wiersz ${lines[i].n}: ${header[1]} bez RTS; nie rozwinięto.`);
        continue;
      }
      subprograms.set(header[1].toUpperCase(), lines.slice(i + 1, end));
      for (let k = i; k <= end; k++) hidden.add(k);
      i = end;
    }

    const variables = Object.create(null), output = [], stack = [];
    let calls = 0;
    function append(block, depth) {
      if (output.length >= 100000) return;
      const code = block.code.trim().replace(/^N\d+\s*/i, '');
      if (!code) return;
      const assignment = code.match(/^(V[A-Z0-9_]*)\s*=\s*(.+)$/i);
      if (assignment) {
        const value = evaluateExpression(assignment[2], variables);
        if (value === null) warnings.push(`Wiersz ${block.n}: nie obliczono ${assignment[1]}; geometria może być niepełna.`);
        else variables[assignment[1].toUpperCase()] = value;
        return;
      }
      const call = code.match(/\bCALL\s+(OS\d+)\b/i);
      if (call) {
        const name = call[1].toUpperCase(), body = subprograms.get(name);
        if (!body) {
          warnings.push(`Wiersz ${block.n}: brak lokalnego podprogramu ${name}.`);
          return;
        }
        if (depth >= 16 || stack.includes(name)) {
          warnings.push(`Wiersz ${block.n}: pominięto rekurencyjne lub zbyt głębokie wywołanie ${name}.`);
          return;
        }
        stack.push(name);
        calls++;
        for (const child of body) append(child, depth + 1);
        stack.pop();
        return;
      }
      if (/\b(?:IF\s*\[|GOTO\b|WHILE\b|DO\b)/i.test(code) && !warnings.some(item => item.includes('warunków i pętli')))
        warnings.push('IF/GOTO/WHILE/DO pozostają w kodzie; warunków i pętli nie wykonano.');
      const resolved = code
        .replace(/\bV[A-Z0-9_]*\b/gi, value => value.toUpperCase() in variables ? String(variables[value.toUpperCase()]) : value)
        .replace(/\b([A-Z])\s*=\s*(?=[+\-\d.(])/gi, '$1');
      output.push({ ...block, code: resolved });
    }
    for (let i = 0; i < lines.length; i++) if (!hidden.has(i)) append(lines[i], 0);
    if (calls) warnings.push(`Rozwinięto ${calls} lokalnych wywołań OSxx; IF/GOTO/WHILE/DO nie są wykonywane.`);
    return output;
  }

  function parse(text, name) {
    const dialect = detectDialect(text, name), warnings = [], motions = [];
    if (dialect === 'Heidenhain Klartext / TBI') return parseHeidenhain(text, dialect);
    if (!['Okuma OSP', 'ISO / G-code', 'Siemens / DMG'].includes(dialect))
      return { dialect, warnings, motions, supported: false, cycles: 0, rotary: 0 };

    const sourceLines = text.replace(/\r\n?/g, '\n').split('\n').map((source, index) => {
      const code = source.replace(/\([^)]*\)/g, ' ').split(';')[0];
      return { n: index + 1, source, code };
    });
    const lines = dialect === 'Okuma OSP' ? expandOkuma(sourceLines, warnings) : sourceLines;
    const position = { X: 0, Y: 0, Z: 0, C: 0 };
    let mode = 0, plane = 'XZ', absolute = true, feed = null, skipG101 = false, activeCycle = false, cycles = 0, rotary = 0, truncated = false;

    for (const line of lines) {
      if (motions.length >= MAX_MOTIONS) {
        truncated = true;
        break;
      }
      let code = line.code.toUpperCase().replace(/\bNCYL\s+G(178|181)\b/g, 'G$1');
      const hasG = value => new RegExp(`G\\s*${value}(?!\\d)`).test(code);
      if (hasG(17)) plane = 'XY';
      if (hasG(18)) plane = 'XZ';
      if (hasG(19)) plane = 'YZ';
      if (hasG(90)) absolute = true;
      if (hasG(91)) absolute = false;
      const gCodes = [...code.matchAll(/G\s*(\d+)/g)].map(match => Number(match[1]));
      if (gCodes.includes(80) || gCodes.includes(180)) {
        skipG101 = false;
        if (gCodes.includes(80)) activeCycle = false;
      }
      if (gCodes.includes(101) && !gCodes.some(value => value <= 3)) {
        skipG101 = true;
        if (!warnings.some(item => item.includes('G101')))
          warnings.push('G101/interpolacja specjalna pozostaje w kodzie, ale nie jest rysowana.');
        continue;
      }
      const words = Object.create(null);
      const expressionWord = /([A-Z])\s*([+\-*\/().\d]+)/g;
      for (const match of code.matchAll(expressionWord)) words[match[1]] = match[2];
      const valueOf = key => words[key] === undefined ? null : evaluateExpression(words[key], Object.create(null));
      if (words.F !== undefined) feed = valueOf('F');
      const motionCode = gCodes.find(value => value >= 0 && value <= 3);
      if (motionCode !== undefined) {
        mode = motionCode;
        skipG101 = false;
      } else if (skipG101) continue;

      const standardCycle = gCodes.some(value => [73, 76, 81, 82, 83, 84, 85, 86, 87, 88, 89].includes(value));
      if (/\bNCYL\s+G(?:178|181)\b/i.test(line.code) || standardCycle || gCodes.some(value => value === 178 || value === 181)) {
        cycles++;
        if (standardCycle) activeCycle = true;
        for (const axis of ['X', 'Y', 'Z', 'C']) {
          const value = valueOf(axis);
          if (value !== null) position[axis] = absolute ? value : position[axis] + value;
        }
        continue;
      }

      const previous = { ...position };
      for (const axis of ['X', 'Y', 'Z', 'C']) {
        const value = valueOf(axis);
        if (value !== null) position[axis] = absolute ? value : position[axis] + value;
      }
      if (activeCycle) continue;
      const hasLinearAxis = ['X', 'Y', 'Z'].some(axis => words[axis] !== undefined), hasRotary = words.C !== undefined;
      if (!hasLinearAxis && !hasRotary) continue;
      if (hasRotary && !hasLinearAxis) {
        rotary++;
        motions.push({ type: 'rotary', line: line.n, source: line.source, from: previous.C, to: position.C });
        continue;
      }
      if (skipG101) continue;

      const arc = mode === 2 || mode === 3;
      const offsets = { I: valueOf('I'), J: valueOf('J'), K: valueOf('K'), R: valueOf('R') };
      if (arc && !([offsets.I, offsets.J, offsets.K].some(finite) || finite(offsets.R)) && !warnings.some(item => item.includes('łuk bez I/J/K/R')))
        warnings.push('Pominięto geometrię łuku bez I/J/K/R; sprawdź dialekt i format bloku.');
      motions.push({
        type: mode === 0 ? 'rapid' : arc ? 'arc' : 'linear', line: line.n, source: line.source, plane,
        clockwise: mode === 2, from: previous, to: { ...position }, offsets, feed
      });
    }
    if (truncated) warnings.push(`Podgląd ograniczono do pierwszych ${MAX_MOTIONS} bloków ruchu.`);
    if (text.match(/G\s*5[4-9](?!\d)/i) && !warnings.some(item => item.includes('układ roboczy')))
      warnings.push('Geometria korzysta z podanych współrzędnych; przesunięć układu roboczego nie obliczono.');
    if (/G\s*(?:10|43|44|49|51|52|68|92)(?!\d)/i.test(text))
      warnings.push('W kodzie występują korekcje lub transformacje układu; nie zostały zastosowane do rysowanej geometrii.');
    if (dialect === 'Siemens / DMG')
      warnings.push('SINUMERIK/DMG: podgląd obejmuje ruchy XYZ G0–G3. Cykle, parametry R, kompensacje i transformacje Siemens nie są interpretowane; geometria jest poglądowa.');
    return { dialect, warnings, motions, supported: true, cycles, rotary, workBounds: null };
  }

  function parseHeidenhain(text, dialect) {
    const warnings = [], motions = [], position = { X: 0, Y: 0, Z: 0 };
    let workBounds = null;
    const number = value => Number(String(value).replace(',', '.'));
    const axisWords = line => {
      const values = Object.create(null);
      for (const match of line.matchAll(/([XYZ])\s*([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))/gi)) values[match[1].toUpperCase()] = number(match[2]);
      return values;
    };
    const bounds = [{}, {}];
    for (const [lineIndex, line] of text.replace(/\r\n?/g, '\n').split('\n').entries()) {
      const source = line, code = line.split(';')[0].trim().replace(/^(?:N?\d+)\s+/, '');
      const blk = code.match(/^BLK\s+FORM\s+0\.([12])\s+(.+)$/i);
      if (blk) {
        const values = axisWords(blk[2]);
        Object.assign(bounds[Number(blk[1]) - 1], values);
        if (['X','Y','Z'].every(axis => axis in bounds[0] && axis in bounds[1]))
          workBounds = Object.fromEntries(['X','Y','Z'].map(axis => [axis, [Math.min(bounds[0][axis], bounds[1][axis]), Math.max(bounds[0][axis], bounds[1][axis])]]));
        continue;
      }
      const command = code.match(/^\s*(CR|L)\b(.*)$/i);
      if (!command) continue;
      const body = command[2], values = axisWords(body), previous = { ...position };
      for (const axis of ['X','Y','Z']) if (axis in values) position[axis] = values[axis];
      if (!['X','Y','Z'].some(axis => axis in values)) continue;
      const rapid = command[1].toUpperCase() === 'L' && /\bFMAX\b/i.test(body);
      const isArc = command[1].toUpperCase() === 'CR';
      const radiusMatch = body.match(/\bR\s*([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))/i);
      const direction = body.match(/\bDR([+-])/i);
      motions.push({ type: rapid ? 'rapid' : isArc ? 'arc' : 'linear', line: lineIndex + 1, source, plane: 'XY', clockwise: direction?.[1] === '-', from: previous, to: { ...position }, offsets: { R: radiusMatch ? number(radiusMatch[1]) : null } });
    }
    if (/\bCYCL\s*DEF|\bFN\s+\d+/i.test(text)) warnings.push('HEIDENHAIN: definicje cykli i FN/parametry nie są wykonywane; rysowane są tylko jawne ruchy L/CR.');
    if (/\bM91\b|\bM92\b/i.test(text)) warnings.push('HEIDENHAIN: M91/M92 są zachowane w kodzie, ale punkty odniesienia maszyny nie są przeliczane.');
    if (!workBounds && /\bBLK\s+FORM\b/i.test(text)) warnings.push('Nie udało się odczytać wszystkich granic BLK FORM; półfabrykat nie będzie rysowany.');
    return { dialect, warnings, motions, supported: true, cycles: 0, rotary: 0, workBounds };
  }

  function axesFor(plane) {
    return plane === 'XY' ? ['X', 'Y', 'I', 'J'] : plane === 'YZ' ? ['Y', 'Z', 'J', 'K'] : ['Z', 'X', 'K', 'I'];
  }

  function arcPoints(motion) {
    const [u, v, iu, iv] = axesFor(motion.plane), start = motion.from, end = motion.to;
    const a = start[u], b = start[v], c = end[u], d = end[v], offsets = motion.offsets;
    let centerU, centerV;
    if (finite(offsets[iu]) && finite(offsets[iv])) {
      centerU = a + offsets[iu];
      centerV = b + offsets[iv];
    } else if (finite(offsets.R)) {
      const dx = c - a, dy = d - b, chord = Math.hypot(dx, dy), radius = Math.abs(offsets.R);
      if (!chord || chord > 2 * radius) return [];
      const height = Math.sqrt(Math.max(0, radius * radius - chord * chord / 4));
      const midX = (a + c) / 2, midY = (b + d) / 2, sign = (motion.clockwise ? -1 : 1) * (offsets.R < 0 ? -1 : 1);
      centerU = midX + sign * (-dy / chord) * height;
      centerV = midY + sign * (dx / chord) * height;
    } else return [];

    const startAngle = Math.atan2(b - centerV, a - centerU), endAngle = Math.atan2(d - centerV, c - centerU), direction = motion.clockwise ? -1 : 1;
    let sweep = endAngle - startAngle;
    if (direction < 0) while (sweep >= 0) sweep -= Math.PI * 2;
    else while (sweep <= 0) sweep += Math.PI * 2;
    const count = Math.max(8, Math.min(48, Math.ceil(Math.abs(sweep) * 8)));
    const radius = Math.hypot(a - centerU, b - centerV), points = [];
    for (let index = 1; index <= count; index++) {
      const angle = startAngle + sweep * index / count;
      const t = index / count, point = { ...start };
      for (const axis of ['X', 'Y', 'Z']) {
        if (axis !== u && axis !== v) point[axis] = start[axis] + (end[axis] - start[axis]) * t;
      }
      point[u] = centerU + radius * Math.cos(angle);
      point[v] = centerV + radius * Math.sin(angle);
      points.push(index === count ? end : point);
    }
    return points;
  }

  function gridStep(span) {
    const raw = span / 8, power = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))));
    const scaled = raw / power;
    return (scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10) * power;
  }

  function automaticView(data) {
    const firstMotion = data.motions.find(motion => motion.type !== 'rotary');
    return firstMotion?.plane === 'XY' ? 'xy' : firstMotion?.plane === 'YZ' ? 'yz' : 'xz';
  }

  function viewDetails(mode) {
    if (mode === 'xy') return { title: 'Rzut z góry · XY', x: 'X', y: 'Y', project: point => [point.X, point.Y], axes: [['X', 1, 0, '#d25a5a'], ['Y', 0, 1, '#5acd78']] };
    if (mode === 'yz') return { title: 'Rzut boczny · YZ', x: 'Z', y: 'Y', project: point => [point.Z, point.Y], axes: [['Z', 1, 0, '#5a96eb'], ['Y', 0, 1, '#5acd78']] };
    // Współrzędne V rosną ku górze; znak minus kieruje ujemne Z do góry ekranu.
    if (mode === 'iso') return { title: 'Widok izometryczny · XYZ', x: 'U', y: 'V', project: point => [(point.X - point.Y) * 0.8660254037844386, -point.Z + (point.X + point.Y) * 0.5], axes: [['X', 0.8660254037844386, 0.5, '#d25a5a'], ['Y', -0.8660254037844386, 0.5, '#5acd78'], ['Z', 0, -1, '#5a96eb']] };
    return { title: 'Rzut przedni · XZ', x: 'Z', y: 'X', project: point => [point.Z, point.X], axes: [['Z', 1, 0, '#5a96eb'], ['X', 0, 1, '#d25a5a']] };
  }

  function renderPlane(motions, mode, showRapid = state.showRapid, workBounds = null) {
    const view = viewDetails(mode), { x: axisX, y: axisY, project } = view;
    const renderable = motions.filter(motion => (showRapid || motion.type !== 'rapid') && (motion.type !== 'arc' || arcPoints(motion).length > 0));
    const points = [];
    for (const motion of renderable) {
      const path = motion.type === 'arc' ? arcPoints(motion) : [motion.to];
      points.push(project(motion.from), ...path.map(project));
    }
    const workCorners = workBounds ? Array.from({ length: 8 }, (_, mask) => ({ X: workBounds.X[(mask >> 0) & 1], Y: workBounds.Y[(mask >> 1) & 1], Z: workBounds.Z[(mask >> 2) & 1] })) : [];
    points.push(...workCorners.map(project));
    if (!points.length) return '';
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of points) {
      if (!finite(x) || !finite(y)) continue;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    if (![minX, maxX, minY, maxY].every(finite)) return '';
    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }
    const padding = Math.max(maxX - minX, maxY - minY) * .08 + 1;
    minX -= padding; maxX += padding; minY -= padding; maxY += padding;
    const width = 900, height = 330, scale = Math.min((width - 48) / (maxX - minX), (height - 48) / (maxY - minY));
    const sx = x => width / 2 + (x - (minX + maxX) / 2) * scale, sy = y => height / 2 - (y - (minY + maxY) / 2) * scale;
    const polylines = renderable.map(motion => {
      const path = motion.type === 'arc' ? arcPoints(motion) : [motion.to];
      const color = motion.type === 'rapid' ? '#8295ad' : motion.type === 'arc' ? '#42d7e8' : '#a5e65b';
      const coordinates = [motion.from, ...path].map(point => {
        const [x, y] = project(point);
        return `${sx(x).toFixed(2)},${sy(y).toFixed(2)}`;
      }).join(' ');
      return `<polyline points="${coordinates}" fill="none" stroke="${color}" stroke-width="${motion.type === 'rapid' ? 1.2 : 2}" ${motion.type === 'rapid' ? 'stroke-dasharray="5 4"' : ''} vector-effect="non-scaling-stroke"><title>Linia ${motion.line}: ${esc(motion.source)}</title></polyline>`;
    }).join('');
    const workEdges = [];
    if (workCorners.length) for (let i = 0; i < workCorners.length; i++) for (let axis = 0; axis < 3; axis++) {
      const j = i ^ (1 << axis);
      if (i < j) {
        const a = project(workCorners[i]), b = project(workCorners[j]);
        workEdges.push(`<line x1="${sx(a[0])}" y1="${sy(a[1])}" x2="${sx(b[0])}" y2="${sy(b[1])}" stroke="#8993a3" stroke-width="1.2" stroke-dasharray="5 4" opacity=".8"><title>BLK FORM – półfabrykat</title></line>`);
      }
    }
    const step = gridStep(Math.max(maxX - minX, maxY - minY)), grid = [];
    for (let x = Math.ceil(minX / step) * step, count = 0; x < maxX && count < 32; x += step, count++) {
      grid.push(`<line x1="${sx(x)}" y1="0" x2="${sx(x)}" y2="${height}" stroke="#263950"/><text x="${sx(x) + 3}" y="${height - 5}" fill="#9eb8e8" font-size="10">${format(x)}</text>`);
    }
    for (let y = Math.ceil(minY / step) * step, count = 0; y < maxY && count < 32; y += step, count++) {
      grid.push(`<line x1="0" y1="${sy(y)}" x2="${width}" y2="${sy(y)}" stroke="#263950"/><text x="4" y="${sy(y) - 3}" fill="#9eb8e8" font-size="10">${format(y)}</text>`);
    }
    const extent = Math.max(maxX - minX, maxY - minY) * 0.65;
    const origin = project({ X: 0, Y: 0, Z: 0 });
    const axes = view.axes.map(([label, dx, dy, color]) => {
      const x1 = sx(origin[0] - dx * extent), y1 = sy(origin[1] - dy * extent);
      const x2 = sx(origin[0] + dx * extent), y2 = sy(origin[1] + dy * extent);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity=".55" stroke-width="1.2"/><text x="${x2 + 4}" y="${y2 - 4}" fill="${color}" font-size="11">${label}</text>`;
    }).join('');
    return `<svg class="cnc-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Schematyczna ścieżka CNC: ${view.title}" preserveAspectRatio="xMidYMid meet">${grid.join('')}${workEdges.join('')}${axes}${polylines}<text x="12" y="18" fill="#c2d7f4" font-size="12">${view.title} · ${renderable.length} ruchów · osie ${axisX}/${axisY}</text></svg>`;
  }

  function renderSvg(data, selectedMode = state.viewMode, showRapid = state.showRapid) {
    if (!data.supported)
      return '<div class="cnc-empty">Dla tego dialektu pokazujemy kod bez generowania grafiki. Parser geometrii nie obsługuje jeszcze tej składni.</div>';
    const movements = data.motions.filter(motion => ['rapid', 'linear', 'arc'].includes(motion.type));
    if (!movements.length) return '<div class="cnc-empty">Brak jednoznacznych ruchów G0–G3 do narysowania.</div>';
    const mode = selectedMode === 'auto' ? automaticView(data) : selectedMode;
    return renderPlane(movements, mode, showRapid, data.workBounds) || '<div class="cnc-empty">Nie udało się utworzyć geometrii z rozpoznanych ruchów.</div>';
  }

  function bindZoom(panel) {
    const svg = panel.querySelector('.cnc-svg, .contour-svg');
    if (!svg || svg.dataset.zoomBound) return;
    svg.dataset.zoomBound = 'true';
    svg.dataset.fitViewBox = svg.getAttribute('viewBox');
    svg.addEventListener('wheel', event => {
      event.preventDefault();
      const box = svg.viewBox.baseVal, point = svg.createSVGPoint();
      point.x = event.clientX; point.y = event.clientY;
      const anchor = point.matrixTransform(svg.getScreenCTM().inverse());
      const factor = event.deltaY < 0 ? 1 / 1.2 : 1.2;
      const width = Math.max(box.width / 40, Math.min(box.width * factor, Number(svg.dataset.fitViewBox.split(/\s+/)[2])));
      const height = Math.max(box.height / 40, Math.min(box.height * factor, Number(svg.dataset.fitViewBox.split(/\s+/)[3])));
      const xRatio = (anchor.x - box.x) / box.width, yRatio = (anchor.y - box.y) / box.height;
      svg.setAttribute('viewBox', `${anchor.x - xRatio * width} ${anchor.y - yRatio * height} ${width} ${height}`);
    }, { passive: false });
    panel.querySelector('[data-cnc-fit]')?.addEventListener('click', () => svg.setAttribute('viewBox', svg.dataset.fitViewBox));
  }

  function render(text, name) {
    const data = parse(text, name);
    state.lastData = data;
    const warnings = data.warnings.length ? `<div class="cnc-warnings">${data.warnings.map(item => `<div>⚠ ${esc(item)}</div>`).join('')}</div>` : '';
    const moveCount = data.motions.filter(motion => ['rapid', 'linear', 'arc'].includes(motion.type)).length;
    const status = data.supported
      ? `${moveCount} ruchów · ${data.cycles} cykli · ${data.rotary} bloków osi C · geometria poglądowa; bez weryfikacji programu.`
      : 'Podgląd tekstu bez interpretacji ścieżki.';
    const viewOptions = [['auto', 'Auto – wg G17/G18/G19'], ['xz', 'Przód XZ – tokarka'], ['xy', 'Góra XY – frezarka'], ['yz', 'Bok YZ'], ['iso', 'Izometryczny XYZ']]
      .map(([value, label]) => `<option value="${value}"${state.viewMode === value ? ' selected' : ''}>${label}</option>`).join('');
    return `<section class="cnc-preview"><div class="cnc-preview-head"><span>${esc(data.dialect)} · podgląd geometrii</span><div><label class="cnc-view-label">Widok osi: <select class="cnc-view-select" data-cnc-view aria-label="Wybór rzutu osi grafiki"${data.supported ? '' : ' disabled'}>${viewOptions}</select></label><button type="button" class="contour-toggle" data-cnc-fit>Dopasuj</button><label class="cnc-rapid-label"><input type="checkbox" data-cnc-rapid${state.showRapid ? ' checked' : ''}>Pokaż G0</label><button type="button" class="contour-toggle" data-cnc-graphic>${state.graphic ? 'Ukryj grafikę' : 'Pokaż grafikę'}</button><button type="button" class="contour-toggle" data-cnc-legend>${state.legend ? 'Ukryj legendę' : 'Pokaż legendę'}</button></div></div><div class="cnc-legend"${state.legend ? '' : ' hidden'}><span><i class="linear"></i>G1 – ruch roboczy</span><span><i class="rapid"></i>G0 – szybki przejazd</span><span><i class="arc"></i>G2/G3 – łuk</span><span><i class="cycle"></i>Cykl – marker informacyjny, bez symulacji</span><span><i class="selected"></i>Żółty – wybrana linia programu</span><span><i class="rotary"></i>Fioletowy – oś C, bez transformacji kinematycznej</span><span>Osie: X czerwony · Y zielony · Z niebieski</span></div><div class="cnc-graphic"${state.graphic ? '' : ' hidden'}>${renderSvg(data)}</div><div class="cnc-status">${status}</div>${warnings}</section>`;
  }

  function bind(panel) {
    panel.querySelector('[data-cnc-view]')?.addEventListener('change', event => {
      state.viewMode = event.target.value;
      const graphic = panel.querySelector('.cnc-graphic');
      if (graphic && state.lastData) graphic.innerHTML = renderSvg(state.lastData, state.viewMode);
      bindZoom(panel);
    });
    panel.querySelector('[data-cnc-rapid]')?.addEventListener('change', event => {
      state.showRapid = event.target.checked;
      const graphic = panel.querySelector('.cnc-graphic');
      if (graphic && state.lastData) graphic.innerHTML = renderSvg(state.lastData, state.viewMode);
      bindZoom(panel);
    });
    bindZoom(panel);
    panel.querySelector('[data-cnc-graphic]')?.addEventListener('click', () => {
      state.graphic = !state.graphic;
      const graphic = panel.querySelector('.cnc-graphic'), button = panel.querySelector('[data-cnc-graphic]');
      graphic.hidden = !state.graphic;
      button.textContent = state.graphic ? 'Ukryj grafikę' : 'Pokaż grafikę';
    });
    panel.querySelector('[data-cnc-legend]')?.addEventListener('click', () => {
      state.legend = !state.legend;
      const legend = panel.querySelector('.cnc-legend'), button = panel.querySelector('[data-cnc-legend]');
      legend.hidden = !state.legend;
      button.textContent = state.legend ? 'Ukryj legendę' : 'Pokaż legendę';
    });
  }

  window.CncGCodePreview = { render, bind, bindZoom };
})();
