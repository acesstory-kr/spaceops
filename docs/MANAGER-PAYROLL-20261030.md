# 운영 매니저 정산 조회 / 모바일 메뉴

기준 dadee82. Owner / Manager 모바일 하단 5번째 인건비 정산. Staff는 표시·API 접근 불가. PC 사이드바와 Manager 관리 화면에도 조회 메뉴. Manager는 완료 사업 업무 자동 정산과 지급 기록 조회만 가능하며 단가·지급 변경은 Owner 전용. 개인 일정 권한 변경 없음.

운영 DB와 운영 배포는 미적용. 적용 전 백업 후 MANAGER-PAYROLL-READ-PREVIEW.sql SELECT 정책 적용이 필요. payment_records는 기존 PAYMENT-RECORDS-PREVIEW.sql 초안의 신규 저장소이며 운영 미적용. 미리보기는 예시 데이터만 사용. 조회 금액은 현재 단가 기준 재계산이며 실제 지급 기록과 별개. 실기기 화면 검증 필요.
