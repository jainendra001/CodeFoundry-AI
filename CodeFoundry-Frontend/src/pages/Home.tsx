import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Code2, Cpu, ArrowRight, Github, Twitter, FileCode, Layout } from 'lucide-react';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-effect border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-primary p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="font-heading text-2xl font-bold text-gradient">
              CodeFoundry.AI
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-purple-400 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-purple-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <button className="px-6 py-2 rounded-lg bg-purple-600/10 border border-purple-500/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all duration-300 font-medium">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-light border border-purple-500/30 mb-8 glow-effect">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium text-purple-300">Powered by Advanced AI</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Build Websites with
            <br />
            <span className="text-gradient animate-gradient">AI Magic</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into production-ready code in seconds. 
            <span className="text-purple-400 font-semibold"> No coding required.</span>
          </p>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-16">
            <div 
              className="relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className={`absolute inset-0 bg-gradient-primary rounded-2xl blur-2xl transition-opacity duration-300 ${isHovered ? 'opacity-40' : 'opacity-20'}`}></div>
              
              <div className="relative glass-effect rounded-2xl p-2 border border-purple-500/30 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Zap className="w-6 h-6 text-purple-400" />
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your dream website... e.g., 'Build a modern portfolio with animations'"
                      className="flex-1 bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none py-4"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-premium flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Start Building</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Code2, label: 'Projects Created', value: '10K+' },
              { icon: Zap, label: 'Average Build Time', value: '< 2 min' },
              { icon: Cpu, label: 'AI Accuracy', value: '98%' },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-effect-light rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <stat.icon className="w-8 h-8 text-purple-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-gradient-gold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Why Choose CodeFoundry.AI?
          </h2>
          <p className="text-xl text-gray-400">Experience the future of web development</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Lightning Fast',
              description: 'Generate production-ready code in seconds with our advanced AI engine',
              icon: Zap,
              gradient: 'from-yellow-400 to-orange-500'
            },
            {
              title: 'Smart & Adaptive',
              description: 'AI that learns from your preferences and creates exactly what you envision',
              icon: Cpu,
              gradient: 'from-purple-400 to-pink-500'
            },
            {
              title: 'Production Ready',
              description: 'Clean, optimized code following best practices and modern standards',
              icon: Code2,
              gradient: 'from-blue-400 to-cyan-500'
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-effect rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 cursor-pointer group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform glow-effect`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Examples Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-gradient">
            See What's Possible
          </h2>
          <p className="text-xl text-gray-400">Real projects built in seconds with AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Modern Portfolio',
              description: 'Sleek, professional portfolio with animations and dark mode',
              image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
              tags: ['React', 'Tailwind', 'Framer Motion'],
              color: 'from-blue-500 to-cyan-500'
            },
            {
              title: 'E-Commerce Store',
              description: 'Full-featured online store with cart and checkout',
              image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop',
              tags: ['React', 'Redux', 'Stripe'],
              color: 'from-purple-500 to-pink-500'
            },
            {
              title: 'Landing Page',
              description: 'High-converting landing page with CTA sections',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
              tags: ['React', 'Tailwind', 'SEO'],
              color: 'from-green-500 to-emerald-500'
            },
            {
              title: 'Dashboard Admin',
              description: 'Analytics dashboard with charts and data visualization',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
              tags: ['React', 'Chart.js', 'API'],
              color: 'from-orange-500 to-red-500'
            },
          ].map((project, index) => (
            <div
              key={index}
              className="group relative glass-effect rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 cursor-pointer hover:scale-105"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-2xl font-semibold mb-2 text-white group-hover:text-gradient transition-all">
                  {project.title}
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 text-xs font-medium bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* View Button */}
                <button className="w-full py-3 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-300 font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3">
                  <Layout className="w-4 h-4" />
                  <span>Build Similar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-10 blur-2xl`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-6">Ready to build your own?</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-premium inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Building Now</span>
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-gradient">
            How It Works
          </h2>
          <p className="text-xl text-gray-400">Three simple steps to your dream website</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600/50 via-pink-600/50 to-purple-600/50 -z-10"></div>

          {[
            {
              step: '01',
              icon: FileCode,
              title: 'Describe Your Vision',
              description: 'Tell our AI what you want to build in plain English',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              step: '02',
              icon: Cpu,
              title: 'AI Generates Code',
              description: 'Watch as AI creates production-ready code in real-time',
              color: 'from-purple-500 to-pink-500'
            },
            {
              step: '03',
              icon: Layout,
              title: 'Preview & Deploy',
              description: 'See live preview and deploy with one click',
              color: 'from-orange-500 to-red-500'
            },
          ].map((step, index) => (
            <div
              key={index}
              className="relative"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Step Number Circle */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full blur-xl opacity-50`}></div>
                  <div className="relative w-12 h-12 bg-gray-900 border-2 border-purple-500 rounded-full flex items-center justify-center">
                    <span className="font-heading font-bold text-purple-300">{step.step}</span>
                  </div>
                </div>
              </div>

              {/* Card */}
              <div className="glass-effect rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 cursor-pointer mt-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br ${step.color} p-4 glow-effect`}>
                  <step.icon className="w-full h-full text-white" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 glass-effect border-t border-purple-500/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">© 2025 CodeFoundry.AI - All rights reserved</p>
            <p className="text-sm">Built with ❤️ using cutting-edge AI technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
