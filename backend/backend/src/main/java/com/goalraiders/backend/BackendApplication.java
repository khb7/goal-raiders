package com.goalraiders.backend;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// Firebase Admin SDK 초기화
	static {
		try {
			boolean firebaseAppAlreadyInitialized = false;
			List<FirebaseApp> firebaseApps = FirebaseApp.getApps();
			if (firebaseApps != null && !firebaseApps.isEmpty()) {
				for (FirebaseApp app : firebaseApps) {
					if (app.getName().equals(FirebaseApp.DEFAULT_APP_NAME)) {
						firebaseAppAlreadyInitialized = true;
						break; // 이미 초기화되었으므로 루프 종료
					}
				}
			}

			if (!firebaseAppAlreadyInitialized) {
				InputStream serviceAccount = new ClassPathResource("serviceAccountKey.json").getInputStream();
				FirebaseOptions options = FirebaseOptions.builder()
						.setCredentials(GoogleCredentials.fromStream(serviceAccount))
						.build();
				FirebaseApp.initializeApp(options);
			} else {
				System.out.println("FirebaseApp [DEFAULT] is already initialized. Skipping re-initialization.");
			}
		} catch (IOException e) {
			System.err.println("Firebase Admin SDK 초기화 실패: " + e.getMessage());
			// 애플리케이션 시작을 막거나, 적절한 오류 처리를 할 수 있습니다.
		}
	}
}
