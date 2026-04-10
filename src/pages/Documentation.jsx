import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { BookOpen, Code, Zap, Shield, Smartphone, Database, Search, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function Documentation() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const docCategories = [
    { id: 'all', name: 'All', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'api', name: 'API Reference', icon: Code },
    { id: 'integration', name: 'Integration', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'mobile', name: 'Mobile', icon: Smartphone }
  ]

  const docs = [
    {
      id: 1,
      category: 'getting-started',
      title: 'Quick Start Guide',
      description: 'Get up and running with DalSiAI in 5 minutes',
      readTime: '5 min',
      level: 'Beginner'
    },
    {
      id: 2,
      category: 'getting-started',
      title: 'Installation & Setup',
      description: 'Complete installation instructions for all platforms',
      readTime: '10 min',
      level: 'Beginner'
    },
    {
      id: 3,
      category: 'api',
      title: 'API Authentication',
      description: 'Learn how to authenticate your API requests',
      readTime: '8 min',
      level: 'Intermediate'
    },
    {
      id: 4,
      category: 'api',
      title: 'Text Analysis Endpoints',
      description: 'Complete reference for text analysis API endpoints',
      readTime: '15 min',
      level: 'Intermediate'
    },
    {
      id: 5,
      category: 'api',
      title: 'Image Processing API',
      description: 'Documentation for image and vision processing endpoints',
      readTime: '12 min',
      level: 'Intermediate'
    },
    {
      id: 6,
      category: 'integration',
      title: 'Python Integration',
      description: 'How to integrate DalSiAI with Python applications',
      readTime: '20 min',
      level: 'Intermediate'
    },
    {
      id: 7,
      category: 'integration',
      title: 'Node.js Integration',
      description: 'JavaScript/Node.js SDK and integration guide',
      readTime: '18 min',
      level: 'Intermediate'
    },
    {
      id: 8,
      category: 'integration',
      title: 'Webhook Configuration',
      description: 'Set up webhooks for real-time event notifications',
      readTime: '10 min',
      level: 'Advanced'
    },
    {
      id: 9,
      category: 'security',
      title: 'Security Best Practices',
      description: 'Essential security guidelines for using DalSiAI',
      readTime: '12 min',
      level: 'Intermediate'
    },
    {
      id: 10,
      category: 'security',
      title: 'Data Privacy & Compliance',
      description: 'GDPR, HIPAA, and compliance documentation',
      readTime: '15 min',
      level: 'Advanced'
    },
    {
      id: 11,
      category: 'mobile',
      title: 'iOS Integration',
      description: 'Build iOS apps with DalSiAI SDK',
      readTime: '25 min',
      level: 'Advanced'
    },
    {
      id: 12,
      category: 'mobile',
      title: 'Android Integration',
      description: 'Build Android apps with DalSiAI SDK',
      readTime: '25 min',
      level: 'Advanced'
    }
  ]

  const filteredDocs = selectedCategory === 'all' 
    ? docs 
    : docs.filter(doc => doc.category === selectedCategory)

  const getLevelColor = (level) => {
    switch(level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400'
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400'
      case 'Advanced': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark"
         style={{
           background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
           minHeight: '100vh'
         }}>
      <Navigation />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Documentation', href: '/documentation' }]} />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
                <span className="text-primary">Documentation</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Comprehensive guides, API references, and tutorials to help you build with DalSiAI.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {docCategories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-background'
                        : 'bg-card border border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Documentation Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <Card key={doc.id} className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getLevelColor(doc.level)}`}>
                        {doc.level}
                      </span>
                      <span className="text-xs text-muted-foreground">{doc.readTime}</span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{doc.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground text-sm mb-6 flex-1">{doc.description}</p>
                    <Button variant="ghost" className="text-primary hover:text-primary/80 justify-start p-0">
                      Read Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No documentation found in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Code Examples Section */}
        <section className="py-16 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Code Examples</h2>
              <p className="text-muted-foreground">Quick code snippets to get you started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-primary" />
                    <span>Python Example</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-background p-4 rounded text-sm overflow-x-auto text-muted-foreground">
{`import dalsi_ai

client = dalsi_ai.Client(
  api_key="your_api_key"
)

result = client.analyze_text(
  text="Your text here"
)

print(result)`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-accent" />
                    <span>JavaScript Example</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-background p-4 rounded text-sm overflow-x-auto text-muted-foreground">
{`const DalsiAI = require('dalsi-ai');

const client = new DalsiAI({
  apiKey: 'your_api_key'
});

const result = await client
  .analyzeText('Your text here');

console.log(result);`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-8 text-center border border-primary/30">
              <h2 className="text-3xl font-bold text-foreground mb-4">Need more help?</h2>
              <p className="text-muted-foreground mb-6">
                Check out our support center or community forum for additional resources and assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90">
                  Visit Support Center
                </Button>
                <Button variant="outline">
                  Join Community
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
