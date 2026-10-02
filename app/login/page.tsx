import type { Metadata } from 'next';
import { AuthScreen } from '@/components/auth-screen';

export const metadata: Metadata = { title: 'Аккаунтқа кіру' };
export default function LoginPage() { return <AuthScreen mode="login" />; }
