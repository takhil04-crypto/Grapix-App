import { CONFIG } from 'src/config-global';
import { _userList } from 'src/_mock/_user';

import { UserEditView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  const { id } = params;

  let currentUser = null;
  try {
    const res = await fetch(`http://localhost:8082/api/customers/${id}`, { cache: 'no-store' });
    if (res.ok) {
      currentUser = await res.json();
    } else {
      console.error('Failed to fetch user:', res.status);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }

  return <UserEditView user={currentUser} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  // if (CONFIG.isStaticExport) {
  //   return _userList.map((user) => ({ id: user.id }));
  // }
  return [];
}
