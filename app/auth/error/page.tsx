import { AppHeader } from '@/components/custom/app-header';
import { SignInDialog } from '@/components/custom/app-header';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
 

export default async function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center">
        <Card className="border-destructive w-full max-w-xl">
          <CardHeader>
            <div className="flex items-center gap-2 ">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Authentication Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="space-y-2">
              <p> We encountered an issue while trying to authenticate your account. This could be due to: </p>
              <ul className="list-disc list-inside space-y-2">
                  <li>Network connectivity issues.</li>
                  <li>Opening the link in a different browser.</li>
                  <li>An expired or invalid authentication link.</li>
              </ul>
              <p> Please try signing in again or contact support if the problem persists. </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-2">
            <SignInDialog retry={true}/>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}