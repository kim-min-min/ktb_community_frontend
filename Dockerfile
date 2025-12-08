# 1) Vite 빌드 단계
FROM node:20-alpine AS build
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# 2) nginx로 정적 파일 서빙
FROM nginx:alpine

# 기본 설정 삭제 후, 우리가 만든 설정 사용
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물을 nginx 루트로 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
