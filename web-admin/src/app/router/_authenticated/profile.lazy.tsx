import { createLazyFileRoute } from '@tanstack/react-router'

import {
  useProfileData,
  useProfileDrawers,
  ProfileHeader,
  ProfileSkeleton,
  ProfileForm,
  SecurityPanel,
  SessionsPanel,
  SecurityLogsTable,
  ChangePasswordDrawer,
} from '@/features/profile'

export const Route = createLazyFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { profileData, isLoading, isSubmitting, updateProfile } = useProfileData()
  const { isPasswordDrawerOpen, openPasswordDrawer, closePasswordDrawer } = useProfileDrawers()

  if (isLoading || !profileData) {
    return <ProfileSkeleton />
  }


  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <ProfileHeader />


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ProfileForm profileData={profileData} isSubmitting={isSubmitting} onSubmit={updateProfile} />
          <SecurityLogsTable />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <SecurityPanel onOpenChangePasswordDrawer={openPasswordDrawer} />
          <SessionsPanel />
        </div>
      </div>

      <ChangePasswordDrawer isOpen={isPasswordDrawerOpen} onClose={closePasswordDrawer} />
    </div>
  )
}
