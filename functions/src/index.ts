// functions/src/index.ts
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

async function assertAdmin(req: CallableRequest<any>): Promise<string> {
  const email = req.auth?.token?.email as string | undefined;
  if (!email) throw new HttpsError("unauthenticated", "Sign in required.");
  const db = getFirestore();
  const doc = await db.collection("admins").doc(email).get();
  if (!doc.exists) throw new HttpsError("permission-denied", "Admin only.");
  return email;
}

/** Delete a user by email (and their /users/{uid}/plants data) */
export const adminDeleteUserByEmail = onCall(async (req) => {
  await assertAdmin(req);
  const targetEmail = String(req.data?.email ?? "").trim();
  if (!targetEmail) throw new HttpsError("invalid-argument", "Email required.");

  const auth = getAuth();
  const userRec = await auth.getUserByEmail(targetEmail).catch(() => null);
  if (!userRec) return { ok: true, message: "User not found (already deleted?)" };

  const uid = userRec.uid;

  // Delete auth user
  await auth.deleteUser(uid);

  // Optional: delete Firestore shelf data
  try {
    const db = getFirestore();
    const userDoc = db.collection("users").doc(uid);
    const plants = await userDoc.collection("plants").get();
    const batch = db.batch();
    plants.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    await userDoc.delete();
  } catch {
    // ignore cleanup errors
  }

  return { ok: true, message: "User deleted." };
});

/** Revoke all sessions (force sign‑out on all devices) */
export const adminRevokeSessionsByEmail = onCall(async (req) => {
  await assertAdmin(req);
  const targetEmail = String(req.data?.email ?? "").trim();
  if (!targetEmail) throw new HttpsError("invalid-argument", "Email required.");

  const auth = getAuth();
  const userRec = await auth.getUserByEmail(targetEmail);
  await auth.revokeRefreshTokens(userRec.uid);
  return { ok: true, message: "All sessions revoked." };
});

/** Generate a password reset link for a user (returns the link) */
export const adminSendPasswordReset = onCall(async (req) => {
  await assertAdmin(req);
  const targetEmail = String(req.data?.email ?? "").trim();
  if (!targetEmail) throw new HttpsError("invalid-argument", "Email required.");

  const auth = getAuth();
  const link = await auth.generatePasswordResetLink(targetEmail);
  return { ok: true, link };
});
