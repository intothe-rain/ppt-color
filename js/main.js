document.addEventListener('DOMContentLoaded', () => {

    const tagCycles = {};

    // ── 태그 버튼 렌더링 ─────────────────────────────────────
    const tagBar = document.getElementById('tagBar');

    Object.entries(TAGS).forEach(([key, tag]) => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.dataset.tag = key;
        btn.textContent = tag.label;
        btn.addEventListener('click', () => selectTag(btn, key));
        tagBar.appendChild(btn);
    });

    function selectTag(btn, key) {
        const tag = TAGS[key];
        const isActive = btn.classList.contains('active');

        document.querySelectorAll('.tag-btn').forEach(b => {
            b.classList.remove('active');
            b.textContent = TAGS[b.dataset.tag].label;
        });

        btn.classList.add('active');

        // 같은 태그 재클릭 시 다음 팔레트로 순환
        if (isActive) {
            tagCycles[key] = ((tagCycles[key] || 0) + 1) % tag.palettes.length;
        } else {
            tagCycles[key] = tagCycles[key] || 0;
        }

        const idx = tagCycles[key];
        const total = tag.palettes.length;
        if (total > 1) {
            btn.textContent = `${tag.label}  ${idx + 1}/${total}`;
        }

        const { colors, description } = tag.palettes[idx];
        renderPalette(colors, description);
    }

    // ── Random ───────────────────────────────────────────────
    document.getElementById('randomBtn').addEventListener('click', () => {
        document.querySelectorAll('.tag-btn').forEach(b => {
            b.classList.remove('active');
            b.textContent = TAGS[b.dataset.tag].label;
        });
        const { colors, description } = getRandomPalette();
        renderPalette(colors, description);
    });

    // ── PPT 미리보기 업데이트 ────────────────────────────────
    function updatePreview(roles) {
        const preview = document.getElementById('pptPreview');
        const get = r => roles.find(c => c.role === r).hex;
        const bg = get('배경');
        // 배경 밝기에 따라 텍스트를 항상 가독성 있는 색으로 고정
        const txt = hexToHsl(bg).l > 55 ? '#1a1a1a' : '#f5f5f5';
        preview.style.setProperty('--p-bg',     bg);
        preview.style.setProperty('--p-txt',    txt);
        preview.style.setProperty('--p-accent', get('강조색'));
        preview.style.setProperty('--p-shape1', get('주요 도형'));
        preview.style.setProperty('--p-shape2', get('보조 도형'));
    }

    // ── 팔레트 렌더링 ────────────────────────────────────────
    function renderPalette(colors, description) {
        const roles = assignRoles(colors);
        updatePreview(roles);

        const swatches = document.getElementById('paletteSwatches');
        swatches.innerHTML = '';
        roles.forEach(({ hex, role }) => {
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.title = '클릭하면 복사됩니다';
            swatch.innerHTML = `
                <div class="swatch-color" style="background:${hex}"></div>
                <div class="swatch-info">
                    <div class="swatch-role">${role}</div>
                    <div class="swatch-hex">${hex.toUpperCase()}</div>
                </div>`;
            swatch.addEventListener('click', () => copyToClipboard(hex.toUpperCase()));
            swatches.appendChild(swatch);
        });

        document.getElementById('paletteDescription').textContent = description;
    }

    // ── 클립보드 복사 ────────────────────────────────────────
    function copyToClipboard(text) {
        const done = () => showToast(`${text} 복사됐어요`);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else {
            fallbackCopy(text, done);
        }
    }

    function fallbackCopy(text, done) {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        done();
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // 첫 번째 태그 기본 선택
    tagBar.querySelector('.tag-btn').click();

});
