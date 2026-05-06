// app/(farmer)/layout.tsx
// Farmer portal shell layout.
// Wraps all farmer routes with:
//   - RoleGuard: ensures only 'farmer' and 'admin' roles can access this group
//   - FarmerShell: handles responsive sidebar and main content layout

import RoleGuard from '@/components/shared/RoleGuard'
import FarmerShell from '@/components/farmer/FarmerShell'

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['farmer', 'admin']}>
      <FarmerShell>
        {children}
      </FarmerShell>
    </RoleGuard>
  )
}
