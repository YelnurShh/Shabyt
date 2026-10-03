import type { Timestamp } from 'firebase/firestore';
import riddles from '@/content/riddles.json';
import { stories } from '@/content/stories';

export type ResourceType = 'none' | 'story' | 'riddle';

export type Assignment = {
  id: string;
  title: string;
  instructions: string;
  resourceType: ResourceType;
  resourceId: string;
  createdBy: string;
  teacherName: string;
  dueDate: string;
  active: boolean;
  createdAt?: Timestamp;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  response: string;
  teacherFeedback: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  reviewedAt?: Timestamp;
};

export const assignmentRiddles = riddles.filter(riddle => riddle.kind !== 'proverb');

export function assignmentResource(assignment: Assignment) {
  if (assignment.resourceType === 'story') {
    if (assignment.resourceId === 'all') return { label: 'Ертегілер бетіне өту', href: '/ertegiler' };
    const story = stories.find(item => item.slug === assignment.resourceId);
    return story ? { label: `Ертегі: ${story.title}`, href: `/ertegiler#story-${story.slug}` } : null;
  }
  if (assignment.resourceType === 'riddle') {
    if (assignment.resourceId === 'all') return { label: 'Жұмбақтар бетіне өту', href: '/zhumbaktar' };
    const riddle = assignmentRiddles.find(item => item.id === assignment.resourceId);
    return riddle ? { label: `Жұмбақ №${riddle.id}`, href: `/zhumbaktar#riddle-${riddle.id}` } : null;
  }
  return null;
}

export function assignmentDate(value: string) {
  if (!value) return '';
  return new Date(`${value}T12:00:00`).toLocaleDateString('kk-KZ', { day: 'numeric', month: 'long', year: 'numeric' });
}
