import { PageTransition } from '@/components/page'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { AnimatePresence } from 'framer-motion'
import { FallbackProps } from 'react-error-boundary'
import { Helmet } from 'react-helmet'
import { SWRConfig } from 'swr'

export const Catch = ({ error }: FallbackProps) => {
  console.error(error)
  return <div>Something went wrong... Caught at _app error boundary</div>
}

export const Pending = () => <div>Loading from _app...</div>

export default function App() {
  return (
    <>
      <Helmet>
        <title>CTalk</title>
      </Helmet>
      <SWRConfig value={{ errorRetryCount: 5 }}>
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition />
        </AnimatePresence>
        <TailwindIndicator />
      </SWRConfig>
    </>
  )
}
