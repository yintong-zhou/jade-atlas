import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { RouterProvider, type createBrowserRouter } from 'react-router'

export function App({
  router,
  queryClient,
}: {
  router: ReturnType<typeof createBrowserRouter>
  queryClient: QueryClient
}) {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MotionConfig>
  )
}
