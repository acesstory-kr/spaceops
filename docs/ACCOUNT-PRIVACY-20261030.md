# 로고 및 본인 개인 일정 미리보기
기준 efdca108991c9e06e588782524983e54534559ad.
첨부 파란 4칸 로고 원본 PNG를 public/spacemanager-brand.png로 복사(이미지 내용 변경 없음).
미리보기 운영 매니저에 '예시 최고 관리자'로 잘못 표시되던 문구 수정.
Owner와 Manager는 각자 개인 일정 화면을 사용. Staff 생성권한은 기존대로 제한.
사업 필터에서는 개인 일정 공간을 숨기고, 개인 화면에서는 개인 필터만 표시.
서버 canUseSpace에서 Manager 자신의 개인 일정 등록 허용. 기존 canReadTask/DB RLS의 owner_id=actor_id 규칙은 그대로 유지.
다른 계정의 개인 일정/사진 조회는 허용하지 않으며 실제 기존 레코드 소유자 이전은 하지 않음.
권한 테스트: Manager 자신의 private 행 INSERT/SELECT, Owner 개인 일정 차단, Owner도 Manager 개인 일정 차단, Staff 권한 상승 차단.
운영 DB 정책/회원 역할/운영 main 변경 없음. 검토 브랜치 feature/account-private-calendar.
