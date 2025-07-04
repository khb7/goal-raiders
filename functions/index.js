const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(); // Firebase Admin SDK 초기화

const db = admin.firestore();

// 난이도별 데미지 맵 (클라이언트와 동일하게 유지)
const DIFFICULTY_DAMAGE_MAP = {
  Easy: 5,
  Medium: 10,
  Hard: 20,
  Epic: 50,
};

/**
 * 클라이언트에서 태스크 완료 요청을 처리하는 Cloud Function.
 * 태스크를 완료하고, 보스에게 데미지를 입히며, Firestore에 업데이트합니다.
 */
exports.completeTask = functions.https.onCall(async (data, context) => {
  // 1. 인증 확인: 사용자가 로그인되어 있는지 확인
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  const userId = context.auth.uid; // 요청을 보낸 사용자의 UID
  const {taskId} = data; // 클라이언트에서 전달받은 태스크 ID

  if (!taskId) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Task ID is required.",
    );
  }

  try {
    // 2. 태스크 정보 가져오기
    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Task not found.");
    }

    const taskData = taskDoc.data();

    // 태스크가 현재 사용자의 것인지 확인
    if (taskData.userId !== userId) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Access denied. This task does not belong to the authenticated user.",
      );
    }

    // 이미 완료된 태스크인지 확인 (반복 태스크가 아닌 경우)
    if (taskData.completed && taskData.recurrenceDays === 0) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Task is already completed and not a recurring task.",
      );
    }

    // 3. 보스 정보 가져오기
    const bossRef = db.collection("bosses").doc(taskData.bossId);
    const bossDoc = await bossRef.get();

    if (!bossDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Boss not found.");
    }

    const bossData = bossDoc.data();

    // 보스가 현재 사용자의 것인지 확인
    if (bossData.userId !== userId) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Access denied. This boss does not belong to the authenticated user.",
      );
    }

    // 4. 데미지 계산 및 보스 HP 업데이트
    const damage = DIFFICULTY_DAMAGE_MAP[taskData.difficulty] || 0;
    let newBossHp = bossData.currentHp - damage;

    // HP가 0 미만으로 내려가지 않도록 처리
    if (newBossHp < 0) {
      newBossHp = 0;
    }

    await bossRef.update({currentHp: newBossHp});

    // 5. 태스크 상태 업데이트
    const updateTaskData = {
      completed: true,
      lastCompleted: admin.firestore.FieldValue.serverTimestamp(),
      // 서버 타임스탬프 사용
    };

    // 반복 태스크의 경우, isDue 상태도 업데이트
    if (taskData.recurrenceDays > 0) {
      updateTaskData.isDue = false; // 완료되었으므로 isDue를 false로 설정
    }

    await taskRef.update(updateTaskData);

    // 6. 성공 응답 반환
    return {
      status: "success",
      message: "Task completed and boss HP updated successfully.",
      newBossHp: newBossHp,
      bossId: bossRef.id,
      taskId: taskRef.id,
    };
  } catch (error) {
    // 에러 로깅 및 클라이언트에 에러 반환
    console.error("Error completing task:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // 이미 HttpsError인 경우 그대로 반환
    }
    throw new functions.https.HttpsError(
        "internal",
        "An unexpected error occurred.",
        error.message,
    );
  }
});
