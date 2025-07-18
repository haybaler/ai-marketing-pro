import Layout from '@/pages/Layout.jsx'
import CaseStudyDetail from '@/pages/CaseStudyDetail.jsx'

export default function CaseStudyDetailPage({ params }) {
  return (
    <Layout>
      <CaseStudyDetail id={params.id} />
    </Layout>
  )
} 