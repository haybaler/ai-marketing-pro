import Layout from '@/pages/Layout.jsx'
import Home from '@/pages/Home.jsx'
import { Toaster } from '@/components/ui/toaster'

export default function Page() {
  return (
    <Layout>
      <Home />
      <Toaster />
    </Layout>
  )
} 