'use client'

//help in managing the state of the application
//which is helping in caching the fetched data from db and also the pushed data in db
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'

const client = new QueryClient()

const Providers = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default Providers;