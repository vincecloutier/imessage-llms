import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>Try Nexus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold">$0</div>
          <p className="text-xs text-muted-foreground">Free for everyone</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Chat on web, iOS, and Android</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Generate code and visualize data</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Write, edit, and create content</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Analyze text and images</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full rounded-full" variant="outline">
            Get started
          </Button>
        </CardFooter>
      </Card>
      <Card className="border-primary/20 bg-primary/5 dark:bg-card">
        <CardHeader>
          <CardTitle>Pro</CardTitle>
          <CardDescription>For everyday productivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold">$17</div>
          <p className="text-xs text-muted-foreground">Per month billed annually</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Everything in Free, plus:</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">More usage*</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Access to unlimited Projects to organize chats and documents</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Ability to search the web</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Extended thinking for complex work</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full rounded-full">Upgrade to Pro</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Max</CardTitle>
          <CardDescription>5–20x more usage than Pro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold">From $100</div>
          <p className="text-xs text-muted-foreground">Per month billed monthly</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Everything in Pro, plus:</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Choose 5x or 20x more usage than Pro*</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Higher output limits for all tasks</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Access to advanced features</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-1" />
              <span className="text-sm">Priority access at high traffic times</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full rounded-full" variant="outline">
            Upgrade to Max
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
