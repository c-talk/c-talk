import { Toaster } from '@/components/ui/toaster'
import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}

// export const Catch = ({ error }: FallbackProps) => {
//   console.error(error)
//   return <div>Something went wrong... Caught at _layout error boundary</div>
// }
