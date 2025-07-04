import { usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation';
import NextLink from 'next/link';
import { redirect as nextRedirect } from 'next/navigation';

export const Link = NextLink;
export const usePathname = useNextPathname;
export const useRouter = useNextRouter;
export const redirect = nextRedirect; 