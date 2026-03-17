# 🌌 SE3C Operational Space v2.3

> **Space Exploration Engineering Experimental Club (SE3C) Integrated Knowledge Database.**
> 상상을 실현으로 바꾸는 실험 정신, 그 모든 기록의 중심.

![Node Status](https://img.shields.io/badge/Node-Active-emerald?style=for-the-badge&logo=target)
![Version](https://img.shields.io/badge/Version-2.3-blue?style=for-the-badge)
![Tech](https://img.shields.io/badge/Built%20with-React%20%7C%20Vite%20%7C%20Tailwind-indigo?style=for-the-badge)

---

## 🛰️ Project Overview

**SE3C Operational Space**는 우주탐사공학실험동아리 SE3C의 모든 실험 기록, 예산 관리, 인원 명단 및 활동 계획을 통합 관리하는 **Knowledge Database System**입니다. Google Docs의 강력한 협업 기능과 현대적인 웹 대시보드를 결합하여, 동아리 운영의 투명성과 효율성을 극대화합니다.

### Key Features

- **Real-time Synchronization**: Google Apps Script(GAS)를 통한 Google Docs 데이터 자동 연동.
- **Hierarchical Dashboard**: 다단계 탭 구조와 제목을 분석하여 체계적인 문서 아카이브 제공.
- **Technical Registry**: Markdown 기반의 정밀한 텍스트, 하이퍼링크 및 데이터 테이블 렌더링.
- **Operational UI**: Notion 스타일의 다크 모드 인터페이스와 시스템 터미널 디자인.
- **Adaptive Grid**: 대화면 모니터부터 모바일 기기까지 대응하는 유동적인 레이아웃.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4.0
- **Documentation**: React Markdown, Remark GFM
- **Backend Service**: Google Apps Script (Advanced Google Docs API)
- **Icons**: Lucide React
- **Typography**: IBM Plex Sans KR

---

## 🚀 Getting Started

### Local Development

1. **Repository Clone**
   ```bash
   git clone https://github.com/Transient-Onlooker/se3cdocs.git
   cd se3cdocs
   ```

2. **Dependencies Install**
   ```bash
   npm install
   ```

3. **Data Synchronization**
   - `sync-data.bat` 파일을 실행하여 최신 Google Docs 데이터를 `public/data.json`으로 가져옵니다.
   - (참고: `sync-data.bat`은 로컬 환경 전용으로, 개인 GAS URL 설정이 필요합니다.)

4. **Launch Server**
   ```bash
   npm run dev
   ```

---

## 📝 Deployment Pipeline

이 프로젝트는 **GitHub Actions**를 통해 자동 배포됩니다.

1. **Push to Main**: 코드를 푸시하면 자동으로 빌드가 시작됩니다.
2. **Automated Fetch**: 배포 과정에서 최신 구글 독스 데이터를 자동으로 가져와 빌드에 포함합니다.
3. **GitHub Pages**: `se3c.mcv.kr` 로 즉시 배포됩니다.

---

## 🛡️ Operational Status

- **Primary Node**: Operational
- **Data Integrity**: Verified
- **Sync Protocol**: v2.3 Active

© 2026 **SE3C Space**. All rights reserved. Developed for Scientific Exploration and Collaboration.
