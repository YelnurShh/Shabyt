import type { Metadata } from 'next';
import { ProfileDashboard } from '@/components/profile-dashboard';

export const metadata: Metadata = {
  title: 'Менің профилім',
  description: 'Shabyt сайтындағы оқушы тапсырмалары, шығармашылық прогресс және мұғалім панелі.',
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}
