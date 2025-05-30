import Link from "next/link"
import { ModeToggle } from "@/components/landing/mode-toggle"
import { LoginForm } from "@/components/landing/login-form"
import { VideoPlayer } from "@/components/landing/video-player"
import { PricingCards } from "@/components/landing/pricing-cards"
import { FeatureSection } from "@/components/landing/feature-section"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Nexus</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your ideas,
              <br />
              <span className="text-primary">amplified</span>
            </h1>
            <p className="text-xl text-muted-foreground">Privacy-first AI that helps you create in confidence.</p>
            <LoginForm />
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <VideoPlayer />
          </div>
        </section>

        <FeatureSection />

        <section id="pricing" className="bg-muted py-16">
          <div className="container space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore plans</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that works best for you and your team.
              </p>
            </div>
            <Tabs defaultValue="individual" className="w-full max-w-3xl mx-auto">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="team">Team & Enterprise</TabsTrigger>
              </TabsList>
              <TabsContent value="individual">
                <PricingCards />
              </TabsContent>
              <TabsContent value="team">
                <div className="text-center p-8">
                  <h3 className="text-xl font-medium mb-2">Contact us for team pricing</h3>
                  <p className="text-muted-foreground mb-4">Get custom pricing for your team's specific needs.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="faq" className="py-16 container">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Nexus and how does it work?</AccordionTrigger>
                <AccordionContent>
                  Nexus is a next-generation AI assistant built to be safe, accurate, and secure to help you do your
                  best work. It uses advanced machine learning to understand your needs and provide helpful responses.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What should I use Nexus for?</AccordionTrigger>
                <AccordionContent>
                  Nexus can help with writing, research, coding, data analysis, creative work, and much more. It's
                  designed to be a versatile assistant for all your productivity needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How much does it cost to use?</AccordionTrigger>
                <AccordionContent>
                  Nexus offers a free tier with basic functionality, a Pro tier at $17/month for everyday productivity,
                  and a Max tier starting at $100/month for advanced features and higher usage limits.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, we take data security very seriously. Nexus is built with privacy-first principles, and we never
                  use your data to train our models without your explicit consent.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I use Nexus with my team?</AccordionTrigger>
                <AccordionContent>
                  We offer team and enterprise plans with collaborative features, shared workspaces, and admin controls.
                  Contact our sales team for more information.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 md:py-12">
        <div className="container flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">Privacy-first AI that helps you create in confidence.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container mt-8 pt-8 border-t">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Nexus AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
