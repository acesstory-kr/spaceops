# 검증 결과 · 2026-10-26

개발 브랜치 feature/family-pwa. PWA 미리보기:
https://spaceops-ak8x3vhw9-keay333-7201.vercel.app
Vercel 상태 READY, 커밋 72daeff7ba9a525a3f95ab5d3f2fa5dafe3119b1.
운영 main은 30e883adfb8edf340fed64d7d4006ee8b35b032a 유지.

| 검증 | 결과 | 증거/범위 |
|---|---|---|
| Next.js 운영 빌드 | 통과 | 19개 경로 생성 |
| TypeScript | 통과 | tsc --noEmit |
| manifest 배포 | 통과 | HTTP200, standalone, scope /, icons192/512 |
| 서비스 워커 배포 | 통과 | HTTP200, JS MIME, no-store, Service-Worker-Allowed / |
| 아이콘 크기 | 통과 | PIL로192/512/512/180 RGB 확인 |
| 캐시 제외 | 통과 | VM 테스트: API/사진/인증/로그인/비밀번호/RSC 미처리 |
| 오프라인 대체 화면 | 로직 통과 | 네트워크 실패 시 공개 offline.html, 개인 HTML 캐시 없음 |
| 업데이트 캐시 정리 | 로직 통과 | SpaceOps 이전 버전 캐시만 삭제 |
| 완료 시각 | 로직 통과 | 서버 시각 생성, 완료 유지, 재개시 제거, 과거 완료 임의생성 안 함 |
| 모바일 UI 실제 렌더링 | 미검증 | 자동 Chromium 다운로드 손상으로 설치 실패 |
| Vercel 브라우저 접근 | 제한 | Vercel 로그인 화면까지 확인, 보호 유지 |
| 실제 업무 응답 조회 | 차단 | 자동 승인 검토: 비공개 업무/개인일정 반환 가능성 |
| iPhone 홈화면 설치 | 사용자 실기기 필요 | /install 단계 참고 |
| Android 홈화면 설치 | 사용자 실기기 필요 | /install 단계 참고 |
| 두 가족 계정 로그인/동기화 | 미검증 | 실제 계정·기기 필요, 비밀번호 공유 불필요 |
| 사진 업로드/삭제 회귀 | 이번 검토 미실시 | 미리보기 쓰기 차단. 기존 운영 기능은 그대로 유지 |
| iCal 예약 회귀 | 이번 검토 미실시 | 운영 원본/예약/소스 변경 없음 |
| 역할별 권한 | 미구현 | 기존 허용계정 정책 유지 |
| 푸시 알림 | 미구현 | 앱 내부 변경 알림만 구현 |
| 임의 공간 관리 | 미구현 | 검토용 스키마 초안만 작성 |

## 재현
- npm run build
- npm run typecheck
- node tests/pwa-security.cjs

## 운영 승인 전
1. 가족 계정/역할, DB 변경안 검토와 별도 승인.
2. 테스트 DB에서 새 권한·사진 메타·알림 기능 구현 및 회귀 검사.
3. 미리보기 실기기 설치, 달력 가로 넘침, 터치, 안전영역 확인.
4. 운영 배포 승인 후 main 반영. 필요시 위 운영 기준 버전으로 롤백.
