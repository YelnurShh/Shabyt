import type { Metadata } from 'next';
import { ProfileDashboard } from '@/components/profile-dashboard';

export const metadata: Metadata = {
  title: 'Менің профилім',
  description: 'Shabyt сайтындағы жеке профиль, оқушы тапсырмалары және шығармашылық прогресс.',
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}
