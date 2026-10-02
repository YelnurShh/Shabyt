import Image from 'next/image';

export function BrandMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <Image className={className} src="/icon.svg" alt="" aria-hidden="true" width={size} height={size} />;
}
