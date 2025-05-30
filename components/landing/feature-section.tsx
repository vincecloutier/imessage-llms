import { BookOpen, Code, Share2 } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="py-16 container">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet Nexus</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Nexus is a next generation AI assistant built to be safe, accurate, and secure to help you do your best work.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
        <div className="space-y-4 order-2 md:order-1">
          <div className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">
            Create with Nexus
          </div>
          <h3 className="text-2xl font-bold">Draft and iterate on websites, graphics, documents, and code</h3>
          <p className="text-muted-foreground">
            Nexus helps you create high-quality content quickly, whether you're writing a blog post, designing a
            website, or coding a new feature.
          </p>
        </div>
        <div className="bg-muted rounded-lg p-6 order-1 md:order-2">
          <div className="aspect-video rounded-md bg-card border shadow-sm flex items-center justify-center">
            <Code className="h-12 w-12 text-primary" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
        <div className="bg-muted rounded-lg p-6">
          <div className="aspect-video rounded-md bg-card border shadow-sm flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">
            Bring your knowledge
          </div>
          <h3 className="text-2xl font-bold">Connect your data and documents for personalized assistance</h3>
          <p className="text-muted-foreground">
            Nexus can learn from your documents, data, and preferences to provide more relevant and personalized help.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-4 order-2 md:order-1">
          <div className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">
            Share and collaborate
          </div>
          <h3 className="text-2xl font-bold">Work together with your team in real-time</h3>
          <p className="text-muted-foreground">
            Share your work with teammates, collaborate on projects, and get feedback in real-time to accelerate your
            workflow.
          </p>
        </div>
        <div className="bg-muted rounded-lg p-6 order-1 md:order-2">
          <div className="aspect-video rounded-md bg-card border shadow-sm flex items-center justify-center">
            <Share2 className="h-12 w-12 text-primary" />
          </div>
        </div>
      </div>
    </section>
  )
}
