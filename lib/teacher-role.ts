import type { User } from 'firebase/auth';
import { doc, getDocFromServer, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase-client';
import { TEACHER_CODE } from './teacher-code';

export async function setTeacherRole(user: User, code: string) {
  if (code.trim().toLocaleUpperCase() !== TEACHER_CODE) {
    throw new Error('Мұғалім коды дұрыс емес.');
  }

  const profileRef = doc(db, 'users', user.uid);
  await updateDoc(profileRef, { role: 'teacher', updatedAt: serverTimestamp() });
  const saved = await getDocFromServer(profileRef);
  if (saved.data()?.role !== 'teacher') {
    throw new Error('Мұғалім рөлі сақталмады. Қайта көріңіз.');
  }
}
