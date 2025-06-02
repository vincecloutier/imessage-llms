import Link from "next/link"
import { LoginForm } from "@/components/landing/login-form"
import { VideoPlayer } from "@/components/landing/video-player"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowDown } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <main className="flex-1">
        <section className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center">
              Have you <br/> met April?
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-center">The world's most human-like AI.</p>
            <LoginForm />
            <div className="absolute bottom-8 justify-center">
              <Link
                href="#faq-section"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Learn More
                <ArrowDown className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <VideoPlayer />
          </div>
        </section>
        <section 
          id="faq-section" 
          className="min-h-screen flex flex-col justify-center items-center py-12 md:py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="w-full max-w-6xl space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start">
            {/* Text content block */}
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Not convinced?
              </h2>
              <h3 className="text-xl text-muted-foreground tracking-tight sm:text-2xl md:text-3xl">
                Here's everything you might want to know.
              </h3>
            </div>

            {/* Accordion block */}
            <div className="w-full">
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
          </div>
        </section>
      </main>
      <footer className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
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
