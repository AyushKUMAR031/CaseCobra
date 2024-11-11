import { db } from '@/db'
import { notFound } from 'next/navigation'
import DesignPreview from './DesignPreview'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

// by default its a server side component
interface PageProps {
  //searchParams is an object with key value pairs like in URL
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const Page = async ({ searchParams }: PageProps) => {
  // 
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  // 
  const { id } = searchParams

  if (!id || typeof id !== 'string') {
    return notFound()
  }

  const configuration = await db.configuration.findUnique({
    where: { id },
  })

  if (!configuration) {
    return notFound()
  }

  // return <DesignPreview configuration={configuration} />

  return <DesignPreview configuration={configuration} user={user!} />
}

export default Page