import { Helmet } from 'react-helmet'
import { Outlet } from 'react-router-dom'
export default function App() {
  return (
    <>
      <Helmet>
        <title>WBook</title>
      </Helmet>
      <Outlet />
    </>
  )
}
