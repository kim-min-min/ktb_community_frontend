# 🎉심야톡방 NightTalk

## Front-end 소개

- “심야톡방”은 2030 사용자를 타깃으로 하는 익명 기반 자유게시판 서비스 입니다.

- `React` 라이브러리를 사용하여 구현했습니다.
- 페이지 라우팅, 인증 체크, 이미지 업로드 UI 등 전체 흐름을 프론트 관점에서 설계 및 개발했습니다.

### 개발 인원 및 기간

- 개발기간 :  2025-11-03 ~ 2025-12-07
- 개발 인원 : 프론트엔드/백엔드 1명 (본인)

### 사용 기술 및 tools
- React (Vite)

### Back-end
- <a href="https://github.com/kim-min-min/ktb_community_backend">Back-end Github</a>

### 폴더 구조
<details>
  <summary>폴더 구조 보기/숨기기</summary>
  <div markdown="1">

      ktb_community_frontend
      ├── node_modules
      ├── public
      ├── src
      │   ├── assets
      │   ├── components
      │   │   └── AppHeader.jsx
      │   ├── pages
      │   │   ├── LoginPage.jsx
      │   │   ├── PasswordEditPage.jsx
      │   │   ├── PostDetailPage.jsx
      │   │   ├── PostEditPage.jsx
      │   │   ├── PostsPage.jsx
      │   │   ├── PostWritePage.jsx
      │   │   ├── ProfileEdit.jsx
      │   │   └── SignupPage.jsx
      │   ├── routes
      │   │   ├── AppRouter.jsx
      │   │   └── RequireAuth.jsx
      │   ├── styles
      │   │   ├── auth.css
      │   │   ├── base.css
      │   │   ├── layout.css
      │   │   ├── posts.css
      │   │   └── profile.css
      │   ├── App.jsx
      │   ├── index.css
      │   ├── main.jsx
      ├── .dockerignore
      ├── .env
      ├── .gitignore
      ├── Dockerfile
      ├── eslint.config.js
      ├── index.html
      ├── nginx.conf
      ├── package-lock.json
      ├── package.json
      ├── README.md
      └── vite.config.js

  </div>
  </details>
  <br/>

## 서비스 화면


|로그인|회원가입|
|---|---|
<img width="500" height="300" alt="다운로드 (2)" src="https://github.com/user-attachments/assets/8067ea88-8886-4e80-b16b-d02ee021416d" />
<img width="500" height="300" alt="다운로드 (8)" src="https://github.com/user-attachments/assets/34d6ace8-fe5f-427c-a60f-50cd9f9faede" />

<br><br>


|게시글 목록|
|---|

<img width="500" height="300" alt="다운로드" src="https://github.com/user-attachments/assets/bb12d939-28a8-4e08-b58d-3a9f44521a15" />

<br><br>


|게시물 작성|게시물 상세,삭제|게시글 수정|
|---|---|---|
<img width="500" height="300" alt="다운로드 (3)" src="https://github.com/user-attachments/assets/b9c6c399-80d7-4ddd-bc1a-5a3f2e87dde4" />
<img width="500" height="300" alt="다운로드 (1)" src="https://github.com/user-attachments/assets/9b13cf53-91da-4de7-b356-830bdf758042" />
<img width="500" height="300" alt="다운로드 (9)" src="https://github.com/user-attachments/assets/47493d25-31ee-4f68-9143-7c18e46744f4" />


<br><br>

|댓글 화면|
|---|
<img width="500" height="300" alt="다운로드 (6)" src="https://github.com/user-attachments/assets/90f37d46-fd09-4b66-9639-13dc8dedd666" />


  
<br><br>

|프로필 수정|비밀번호 수정|로그아웃|
|---|---|---|
<img width="500" height="300" alt="다운로드 (4)" src="https://github.com/user-attachments/assets/f6aadc57-26f3-4280-9ee2-d403795ce6fe" />
<img width="500" height="300" alt="다운로드 (5)" src="https://github.com/user-attachments/assets/00f77d00-d250-419e-a178-247e02b455f1" />
<img width="500" height="300" alt="다운로드 (10)" src="https://github.com/user-attachments/assets/62aa8aff-3ce4-4dfa-91f2-6f19ca2b98dc" />


<br/>

## 트러블 슈팅

추후 작성 ...

<br/>

## 프로젝트 후기
이번 프로젝트는 React 기반 커뮤니티 서비스 전체 UI를 설계·구현하는 데 집중한 경험이었습니다.

보호 라우팅(RequireAuth)을 직접 구현하며 인증 흐름을 명확히 이해, 

게시글/댓글 UI를 만들면서 상태 관리 구조를 정리할 수 있었음, 

이미지 업로드 등 파일 처리 UI 구성 능력 향상

다음 프론트 프로젝트에서는,더 세련된 디자인 시스템, 상태관리 라이브러리(Recoil/Zustand), 애니메이션 등 적용을 목표로 하고 있습니다.
<br/>
<br/>
<br/>
