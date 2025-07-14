import Header from '@/components/Header';
import { useUser } from '@/hooks/useUser';
import PageContent from './components/PageContents';
import getSongs from '@/actions/getSongs';
import WelcomeHeading from '@/components/UserGreeting';
import UserGreeting from '@/components/UserGreeting';

export const revalidate = 0;

export default async function Page() {
  const songs = await getSongs();

  return (
    <>
      <Header>
        <UserGreeting />
      </Header>
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">Newest Songs</h1>
        </div>
        <div>
          <div>
            <PageContent songs={songs} />
          </div>
        </div>
      </div>
    </>
  );
}
