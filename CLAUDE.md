# ppt_color — 프로젝트 지침

> 상위 공통 지침: [../CLAUDE.md](../CLAUDE.md)

## 프로젝트 개요

PPT·디자인 작업용 색상 팔레트 추천 웹앱. 자세한 내용은 [blueprint.md](blueprint.md) 참고.

## 기술 스택

- Vanilla HTML / CSS / JS (프레임워크 없음)
- chroma.js — CDN (SRI 해시 적용)
- Canvas API — 이미지 색상 추출

## 파일 규칙

- HTML / CSS / JS 반드시 분리 (index.html에 스타일·스크립트 인라인 금지)
- JS 로직은 역할별로 `js/` 하위에 분리 (colorTheory.js, imageAnalyzer.js, main.js)

## 배포

- Cloudflare Pages + GitHub 자동 배포
- 빌드 도구 없음 — 파일 그대로 배포
