// HEX <-> HSL 변환
function hexToHsl(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: l * 100 };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 밝기 기준으로 PPT 용도 역할 지정
function assignRoles(colors) {
    const withL = colors.map(hex => ({ hex, l: hexToHsl(hex).l }));
    withL.sort((a, b) => a.l - b.l);
    const roles = ['텍스트', '주요 도형', '강조색', '보조 도형', '배경'];
    return withL.map((c, i) => ({ hex: c.hex, role: roles[i] }));
}

// ─── 태그별 팔레트 ────────────────────────────────────────────────────────────
// 같은 태그를 다시 누르면 다음 팔레트로 순환됩니다.
// P1: Tailwind 디자인 시스템 기반 / P2-3: Color Hunt 큐레이션 스타일
const TAGS = {
    pastel: {
        label: 'Pastel',
        palettes: [
            { colors: ['#fda4af', '#fdba74', '#fef08a', '#86efac', '#93c5fd'], description: '멀티컬러 파스텔 톤입니다. 다양한 색감을 부드럽게 배치해 따뜻하고 사랑스러운 분위기를 만듭니다.' },
            { colors: ['#ffcad4', '#f4a8a8', '#f8edeb', '#cddafd', '#dfe7fd'], description: '핑크-라벤더 계열 파스텔입니다. 감성적이고 섬세한 느낌의 자료에 잘 어울립니다.' },
            { colors: ['#ffc8dd', '#ffafcc', '#cdb4db', '#bde0fe', '#a2d2ff'], description: '보라-파랑 계열 파스텔입니다. 창의적이고 독특한 인상을 줍니다.' },
        ],
    },
    dark: {
        label: 'Dark',
        palettes: [
            { colors: ['#0f172a', '#1e293b', '#334155', '#e11d48', '#f1f5f9'], description: '슬레이트-로즈 다크 팔레트입니다. 세련되고 모던한 발표 자료에 강한 임팩트를 줍니다.' },
            { colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'], description: '네이비-레드 다크 팔레트입니다. 무게감과 신뢰감을 동시에 전달합니다.' },
            { colors: ['#090909', '#1c1c1c', '#393939', '#b5a642', '#f0ebe1'], description: '블랙-골드 다크 팔레트입니다. 럭셔리하고 격식 있는 자료에 어울립니다.' },
        ],
    },
    warm: {
        label: 'Warm',
        palettes: [
            { colors: ['#7f1d1d', '#b91c1c', '#ea580c', '#f59e0b', '#fef9c3'], description: '레드-앰버 웜 팔레트입니다. 에너지와 열정을 표현하는 교육·마케팅 자료에 적합합니다.' },
            { colors: ['#9b2335', '#d4380d', '#f97316', '#fadb14', '#fff7e6'], description: '딥레드-옐로우 팔레트입니다. 강렬하고 역동적인 발표 자료에 잘 어울립니다.' },
            { colors: ['#6b1209', '#cf4019', '#f06c30', '#f5c06d', '#fff3e0'], description: '번트 오렌지 팔레트입니다. 따뜻하고 안정감 있는 자료에 적합합니다.' },
        ],
    },
    cold: {
        label: 'Cold',
        palettes: [
            { colors: ['#1e3a8a', '#1d4ed8', '#60a5fa', '#bfdbfe', '#eff6ff'], description: '블루 스펙트럼 팔레트입니다. 신뢰감과 집중력을 높여주는 기업·데이터 자료에 적합합니다.' },
            { colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'], description: '딥블루-시안 팔레트입니다. 테크·IT·과학 분야 자료에 잘 어울립니다.' },
            { colors: ['#0a0a2e', '#1a237e', '#3f51b5', '#90caf9', '#e3f2fd'], description: '인디고-블루 팔레트입니다. 차분하고 전문적인 발표 분위기를 만듭니다.' },
        ],
    },
    earth: {
        label: 'Earth',
        palettes: [
            { colors: ['#292524', '#78716c', '#a8a29e', '#d6d3d1', '#fafaf9'], description: '스톤 뉴트럴 팔레트입니다. 미니멀하고 세련된 분위기로 어떤 주제에도 무난히 어울립니다.' },
            { colors: ['#3e2723', '#6d4c41', '#a1887f', '#d7ccc8', '#efebe9'], description: '브라운 어스 팔레트입니다. 안정적이고 자연스러운 느낌을 줍니다.' },
            { colors: ['#1a0f0a', '#5d3a1a', '#9c6b3c', '#d4b896', '#f7ead8'], description: '세피아 팔레트입니다. 따뜻하고 빈티지한 느낌의 자료에 잘 어울립니다.' },
        ],
    },
    vintage: {
        label: 'Vintage',
        palettes: [
            { colors: ['#2d1b0e', '#7d4e1e', '#be8a4a', '#e4c989', '#f9f0dd'], description: '세피아-골드 빈티지 팔레트입니다. 고전적이고 품격 있는 자료에 어울립니다.' },
            { colors: ['#4a2040', '#8b4f72', '#c38fa0', '#e8c9d4', '#f9f0f3'], description: '빈티지 로즈 팔레트입니다. 우아하고 복고적인 분위기를 만듭니다.' },
            { colors: ['#263b2e', '#5c7a5e', '#94b49f', '#d4e4d8', '#f0f7f2'], description: '빈티지 그린 팔레트입니다. 자연스럽고 차분한 레트로 감성을 줍니다.' },
        ],
    },
    neon: {
        label: 'Neon',
        palettes: [
            { colors: ['#0d0d0d', '#ff0080', '#00ff94', '#00e5ff', '#f5f5f5'], description: '다크 배경의 네온 팔레트입니다. 강렬한 임팩트가 필요한 자료에 어울립니다.' },
            { colors: ['#0d0d0d', '#ff2965', '#ff7b00', '#1dff6e', '#ffffff'], description: '트리플 네온 팔레트입니다. 젊고 역동적인 발표에서 시선을 사로잡습니다.' },
            { colors: ['#09001a', '#cc00ff', '#00cfff', '#fe0047', '#f0f0ff'], description: '사이버펑크 팔레트입니다. 미래적이고 강렬한 인상을 줍니다.' },
        ],
    },
    soft: {
        label: 'Soft',
        palettes: [
            { colors: ['#ddd6fe', '#c7d2fe', '#bae6fd', '#bbf7d0', '#fef3c7'], description: '소프트 멀티컬러 팔레트입니다. 눈이 편안하고 세련된 느낌으로 어떤 자료에도 잘 어울립니다.' },
            { colors: ['#fce7f3', '#ede9fe', '#e0f2fe', '#d1fae5', '#fef9c3'], description: '파스텔 소프트 팔레트입니다. 포근하고 부드러운 분위기를 만듭니다.' },
            { colors: ['#e9d5ff', '#c7d2fe', '#bfdbfe', '#d1fae5', '#fef3c7'], description: '라벤더-민트 소프트 팔레트입니다. 편안하고 균형 잡힌 자료에 적합합니다.' },
        ],
    },
    bold: {
        label: 'Bold',
        palettes: [
            { colors: ['#be123c', '#b45309', '#15803d', '#0369a1', '#6d28d9'], description: 'Tailwind 700 레벨 5색 볼드 팔레트입니다. 자신감 있고 강렬한 자료에 어울립니다.' },
            { colors: ['#c0392b', '#d68910', '#1d8348', '#1a5276', '#6c3483'], description: '5색 멀티 볼드 팔레트입니다. 각 섹션을 뚜렷하게 구분할 때 효과적입니다.' },
            { colors: ['#922b21', '#b7950b', '#1e8449', '#1f618d', '#76448a'], description: '머티리얼 딥 팔레트입니다. 차분하면서도 강한 존재감을 가집니다.' },
        ],
    },
    natural: {
        label: 'Natural',
        palettes: [
            { colors: ['#14532d', '#15803d', '#4ade80', '#bbf7d0', '#f0fdf4'], description: 'Tailwind 그린 스케일 팔레트입니다. 신선하고 생동감 있는 자연 이미지를 표현합니다.' },
            { colors: ['#1b4332', '#2d6a4f', '#52b788', '#b7e4c7', '#f0fff4'], description: '포레스트 그린 팔레트입니다. 환경·지속가능성 관련 자료에 적합합니다.' },
            { colors: ['#1a2e1a', '#2d5a27', '#4a7c3f', '#8ab876', '#d4eacc'], description: '올리브 그린 팔레트입니다. 차분하고 깊이 있는 자연 감성을 줍니다.' },
        ],
    },
    sky: {
        label: 'Sky',
        palettes: [
            { colors: ['#0c4a6e', '#0284c7', '#38bdf8', '#bae6fd', '#f0f9ff'], description: 'Tailwind 스카이 스케일 팔레트입니다. 개방적이고 신뢰감 있는 분위기를 만듭니다.' },
            { colors: ['#0a2342', '#1a5276', '#2e86c1', '#85c1e9', '#ebf5fb'], description: '딥스카이 팔레트입니다. 전문적이고 안정적인 발표 자료에 적합합니다.' },
            { colors: ['#0e3a5c', '#1565c0', '#42a5f5', '#90caf9', '#e3f2fd'], description: '미드나잇-스카이 팔레트입니다. 차갑고 선명한 느낌으로 테크 자료에 어울립니다.' },
        ],
    },
    sunset: {
        label: 'Sunset',
        palettes: [
            { colors: ['#7f1d1d', '#c2410c', '#f97316', '#fbbf24', '#fef3c7'], description: '레드-앰버 선셋 팔레트입니다. 노을처럼 따뜻하고 감성적인 자료에 어울립니다.' },
            { colors: ['#881337', '#c0392b', '#e74c3c', '#ff6b35', '#ffd4a8'], description: '로즈-오렌지 선셋 팔레트입니다. 열정적이고 따뜻한 인상을 줍니다.' },
            { colors: ['#4a0e1a', '#942235', '#d4603a', '#f0a76b', '#fde8c3'], description: '딥선셋 팔레트입니다. 드라마틱하고 감성적인 발표에 어울립니다.' },
        ],
    },
};

// ─── Random - Tailwind 스케일 방식으로 생성 ───────────────────────────────────
function getRandomPalette() {
    const h = Math.floor(Math.random() * 360);
    const type = Math.floor(Math.random() * 3);

    const scales = [
        { s: 58, l: 17 },
        { s: 65, l: 30 },
        { s: 70, l: 49 },
        { s: 50, l: 80 },
        { s: 18, l: 96 },
    ];

    let colors, description;

    if (type === 0) {
        colors = scales.map(({ s, l }) => hslToHex(h, s, l));
        description = '단색 그라데이션으로 생성된 팔레트입니다. 통일감 있는 자료에 어울립니다.';
    } else if (type === 1) {
        const h2 = (h + 35) % 360;
        colors = [
            hslToHex(h, 62, 22),
            hslToHex(h, 68, 42),
            hslToHex(h2, 66, 52),
            hslToHex(h2, 48, 78),
            hslToHex(h, 16, 96),
        ];
        description = '유사 색상으로 생성된 자연스러운 팔레트입니다.';
    } else {
        const accent = (h + 175) % 360;
        colors = [
            hslToHex(h, 58, 18),
            hslToHex(h, 64, 36),
            hslToHex(accent, 68, 52),
            hslToHex(h, 38, 82),
            hslToHex(h, 14, 96),
        ];
        description = '대비 강조 색상이 포함된 팔레트입니다.';
    }

    return { colors, description };
}
