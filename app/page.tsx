import Link from "next/link"
import { LoginForm } from "@/components/landing/login-form"
import { VideoPlayer } from "@/components/landing/video-player"
import { PricingCards } from "@/components/landing/pricing-cards"
import { FeatureSection } from "@/components/landing/feature-section"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <main className="flex-1">
        <section className=" grid items-center gap-6 pb-8 pt-6 md:py-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Have you met April?
            </h1>
            <p className="text-xl text-muted-foreground">Fun, safe, and secure.</p>
            <LoginForm />
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <VideoPlayer />
          </div>
        </section>

        <FeatureSection />
        <section id="pricing" className="">
          <div className=" space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore Plans</h2>
            </div>
                <PricingCards />
          </div>
        </section>
        <section id="faq" className="py-16 ">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl">Not convinced?</h2>
            <h3 className="text-xl text-muted-foreground tracking-tight text-center sm:text-2xl"> Here's everything you might want to know.</h3>
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
      <footer className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <ul className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 text-xs text-muted-foreground">
              <li>
                <Link href="https://legal.aprilintelligence.com/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="https://legal.aprilintelligence.com/terms" className="text-muted-foreground hover:text-foreground">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                © {new Date().getFullYear()} April Intelligence.
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
