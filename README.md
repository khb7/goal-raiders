# Goal Raiders

Goal Raiders는 사용자가 목표를 설정하고, 해당 목표를 달성하기 위한 일일 작업을 관리하며, 게임화된 요소를 통해 동기를 부여받을 수 있도록 돕는 애플리케이션입니다.

## 주요 기능

*   **목표 설정 및 관리:** 장기 목표를 설정하고 진행 상황을 추적합니다.
*   **작업 관리:** 목표 달성을 위한 일일 작업을 생성, 수정, 완료합니다.
*   **게임화 요소:** 목표 달성 및 작업 완료를 통해 보상을 얻고, 캐릭터를 성장시키는 등 게임과 같은 경험을 제공합니다.
*   **사용자 인증:** Firebase를 통한 안전한 사용자 인증을 제공합니다.

## 아키텍처

Goal Raiders는 다음과 같은 세 가지 주요 구성 요소로 이루어진 모놀리식 아키텍처를 가지고 있습니다.

*   **프론트엔드 (Frontend):** React 기반의 웹 애플리케이션으로 사용자 인터페이스를 담당합니다.
*   **백엔드 (Backend):** Spring Boot 기반의 RESTful API 서버로 비즈니스 로직 및 데이터 처리를 담당합니다.
*   **Firebase Functions:** 사용자 인증 및 기타 서버리스 기능을 제공합니다.

```
+-------------------+       +-------------------+       +-------------------+
|    Frontend       |       |     Backend       |       |  Firebase         |
|   (React App)     |<----->|   (Spring Boot)   |<----->|  (Authentication, |
|                   |       |                   |       |   Functions)      |
+-------------------+       +-------------------+       +-------------------+
          |                           |
          |                           |
          v                           v
+-------------------------------------------------+
|                 Firestore / MySQL               |
|               (Database)                        |
+-------------------------------------------------+
```

## 기술 스택

*   **프론트엔드:**
    *   React
    *   JavaScript
    *   HTML/CSS
*   **백엔드:**
    *   Java 17
    *   Spring Boot
    *   Spring Data JPA
    *   MySQL (운영) / H2 (개발/테스트)
    *   Firebase Admin SDK
*   **Firebase Functions:**
    *   Node.js
    *   Firebase SDK
*   **데이터베이스:**
    *   Google Cloud Firestore
    *   MySQL

## 사전 준비 사항

프로젝트를 로컬에서 실행하기 위해 다음 도구들이 설치되어 있어야 합니다:

*   **Node.js** (LTS 버전 권장) 및 **npm**
*   **Java Development Kit (JDK) 17** 이상
*   **Maven** (백엔드 빌드용)
*   **Firebase CLI** (`npm install -g firebase-tools`)

## 시작하기 (개발 환경 설정)

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/goal-raiders.git
cd goal-raiders
```

### 2. Firebase 프로젝트 설정

1.  Firebase 콘솔에서 새 프로젝트를 생성합니다.
2.  프로젝트 설정에서 웹 앱을 추가하고 Firebase 구성 정보를 복사합니다.
3.  `public/index.html` 파일에 Firebase SDK 스크립트를 추가하거나, `src/firebaseConfig.js` (새로 생성해야 할 수도 있음) 파일에 구성 정보를 추가합니다.
4.  **서비스 계정 키:** 백엔드에서 Firebase Admin SDK를 사용하기 위해 서비스 계정 키를 다운로드합니다. 다운로드한 `serviceAccountKey.json` 파일을 `backend/backend/src/main/resources/` 경로에 저장합니다.
5.  **Firestore 보안 규칙:** `firestore.rules` 파일을 Firebase 프로젝트에 배포합니다.
    ```bash
    firebase deploy --only firestore:rules
    ```
6.  **Firebase Functions 배포:**
    ```bash
    cd functions
    npm install
    firebase deploy --only functions
    cd ..
    ```

### 3. 백엔드 설정 및 실행

1.  `backend/backend/src/main/resources/application.properties` 파일을 열어 데이터베이스 연결 정보를 설정합니다. (개발용 H2 또는 로컬 MySQL)
    *   **H2 (개발용):**
        ```properties
        spring.h2.console.enabled=true
        spring.datasource.url=jdbc:h2:mem:testdb
        spring.datasource.driverClassName=org.h2.Driver
        spring.datasource.username=sa
        spring.datasource.password=
        spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
        ```
    *   **MySQL (로컬):**
        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/goalraiders?useSSL=false&serverTimezone=UTC
        spring.datasource.username=your_mysql_username
        spring.datasource.password=your_mysql_password
        spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
        spring.jpa.hibernate.ddl-auto=update # 개발 시에만 사용, 운영에서는 migrate 툴 사용 권장
        spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
        ```
2.  백엔드 디렉토리로 이동하여 빌드 및 실행합니다.
    ```bash
    cd backend/backend
    ./mvnw clean install
    ./mvnw spring-boot:run
    # 또는 java -jar target/backend-0.0.1-SNAPSHOT.jar
    ```
    백엔드는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 4. 프론트엔드 설정 및 실행

1.  루트 디렉토리로 이동하여 의존성을 설치합니다.
    ```bash
    cd .. # If you are in backend/backend directory
    npm install
    ```
2.  프론트엔드 애플리케이션을 실행합니다.
    ```bash
    npm start
    ```
    프론트엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 문서화

백엔드 API 문서는 [Springdoc OpenAPI](https://springdoc.org/)를 사용하여 자동으로 생성됩니다. 백엔드 애플리케이션이 실행 중인 경우 다음 URL에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

*   **Swagger UI:** `http://localhost:8080/swagger-ui.html`

## 프로젝트 구조

```
.
├── backend/                 # Spring Boot 백엔드 프로젝트
│   └── backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/goalraiders/backend/ # Java 소스 코드
│       │   │   └── resources/                   # 설정 파일 (application.properties, serviceAccountKey.json)
│       │   └── test/                            # 테스트 코드
│       └── pom.xml                              # Maven 프로젝트 설정 파일
├── functions/               # Firebase Cloud Functions
│   ├── index.js             # Cloud Functions 소스 코드
│   └── package.json         # Node.js 의존성
├── public/                  # 정적 파일 (index.html 등)
├── src/                     # React 프론트엔드 소스 코드
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── contexts/            # React Context API
│   ├── pages/               # 페이지 컴포넌트
│   ├── routes/              # 라우팅 설정
│   ├── services/            # API 호출 및 외부 서비스 연동 로직
│   ├── styles/              # CSS 스타일 파일
│   └── utils/               # 유틸리티 함수
├── .gitignore               # Git 무시 파일
├── firebase.json            # Firebase CLI 설정
├── firestore.rules          # Firestore 보안 규칙
├── package.json             # 프론트엔드 및 루트 프로젝트 의존성
└── README.md                # 프로젝트 설명 문서
```

## 기여

프로젝트 기여에 대한 내용은 추후 추가될 예정입니다.

## 라이선스

프로젝트 라이선스는 추후 추가될 예정입니다.