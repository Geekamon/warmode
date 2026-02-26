'use client';

import Link from 'next/link';
import { ArrowRight, Users, Zap, MapPin, DollarSign, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#1A1A1A' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold" style={{ color: '#F9A825' }}>
            ⚔️ WARMODE
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it works</a>
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 font-bold text-white rounded-lg hover:text-[#F9A825] transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{ backgroundColor: '#F9A825' }}
              className="px-6 py-2 font-bold text-black rounded-lg hover:opacity-90 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4" style={{ color: '#F9A825', letterSpacing: '-0.02em' }}>
              WARMODE
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white mb-2">
              Activate War Mode. Go to war with your goals.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Virtual coworking & accountability community built for Nigeria. Work together, stay focused, celebrate wins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/signup"
              style={{ backgroundColor: '#F9A825' }}
              className="px-8 py-4 font-bold text-black rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 text-lg"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
            <a
              href="#how-it-works"
              style={{ borderColor: '#F9A825' }}
              className="px-8 py-4 font-bold text-white rounded-lg border-2 hover:bg-white hover:bg-opacity-5 transition text-lg"
            >
              Learn More
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 max-w-2xl mx-auto">
            <div>
              <p style={{ color: '#F9A825' }} className="text-xl md:text-3xl font-bold">1,247</p>
              <p className="text-gray-400 text-sm">warriors online now</p>
            </div>
            <div>
              <p style={{ color: '#F9A825' }} className="text-xl md:text-3xl font-bold">18,000+</p>
              <p className="text-gray-400 text-sm">warriors total</p>
            </div>
            <div>
              <p style={{ color: '#F9A825' }} className="text-xl md:text-3xl font-bold">142K</p>
              <p className="text-gray-400 text-sm">sessions completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ backgroundColor: '#111111', borderColor: '#2A2A2A' }} className="py-20 md:py-32 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Book a Session', desc: 'Choose your focus time and commit to your goals' },
              { num: '02', title: 'Get Matched', desc: 'Connect with warriors working on similar goals' },
              { num: '03', title: 'Work Together', desc: 'Cowork in real-time, stay accountable together' },
              { num: '04', title: 'Celebrate Wins', desc: 'Mark progress, share victories with community' },
            ].map((step, i) => (
              <div key={i} style={{ backgroundColor: '#1E1E1E', borderColor: '#2A2A2A' }} className="p-8 rounded-xl border">
                <p style={{ color: '#F9A825' }} className="text-4xl font-black mb-2">{step.num}</p>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16">Why Warriors Choose WarMode</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                icon: <Zap size={32} />,
                title: 'Low Bandwidth Mode',
                desc: 'Works seamlessly on slow internet. Built for Nigeria\'s connectivity reality.'
              },
              {
                icon: <DollarSign size={32} />,
                title: 'Local Payments',
                desc: 'Pay with Paystack in Naira. No FX rates, no hidden fees. Simple pricing for Nigerians.'
              },
              {
                icon: <Users size={32} />,
                title: 'Community Matching',
                desc: 'Get matched with warriors pursuing your goals. Build accountability partnerships.'
              },
              {
                icon: <MapPin size={32} />,
                title: 'Built for Nigeria',
                desc: 'Naira pricing, Nigerian timezone, Nigerian warrior community at your fingertips.'
              },
            ].map((feature, i) => (
              <div key={i} style={{ backgroundColor: '#111111', borderColor: '#2A2A2A' }} className="p-10 rounded-xl border flex gap-6">
                <div style={{ color: '#F9A825' }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ backgroundColor: '#111111', borderColor: '#2A2A2A' }} className="py-20 md:py-32 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16">Simple Pricing for Warriors</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Free',
                price: '₦0',
                period: '/month',
                features: ['1 session/month', 'Community access', 'Basic matching'],
                highlighted: false
              },
              {
                name: 'Student',
                price: '₦300',
                period: '/month',
                features: ['10 sessions/month', 'Premium matching', 'Weekly goals tracking'],
                highlighted: false
              },
              {
                name: 'Soldier',
                price: '₦1,500',
                period: '/month',
                features: ['Unlimited sessions', 'Priority matching', 'Goals coaching', 'Community badge'],
                highlighted: true
              },
              {
                name: 'Squad',
                price: '₦3,000',
                period: '+/month',
                features: ['Everything in Soldier', 'Team workspace', 'Private sessions', 'Dedicated support'],
                highlighted: false
              },
            ].map((plan, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: plan.highlighted ? '#F9A825' : '#1E1E1E',
                  borderColor: '#2A2A2A',
                }}
                className={`p-8 rounded-xl border relative transform transition ${plan.highlighted ? 'md:scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <div style={{ backgroundColor: '#1B5E20' }} className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-sm font-bold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-black text-opacity-70' : 'text-gray-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className={`flex items-center gap-2 ${plan.highlighted ? 'text-black' : 'text-gray-300'}`}>
                      <CheckCircle size={18} />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.name === 'Free' ? (
                  <Link
                    href="/signup"
                    style={{
                      backgroundColor: '#F9A825',
                      color: '#000',
                    }}
                    className="w-full py-3 font-bold rounded-lg hover:opacity-90 transition block text-center"
                  >
                    Get Started Free
                  </Link>
                ) : (
                  <button
                    disabled
                    style={{
                      backgroundColor: plan.highlighted ? '#1A1A1A' : '#F9A825',
                      color: plan.highlighted ? '#F9A825' : '#000',
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    }}
                    className="w-full py-3 font-bold rounded-lg transition"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Ready to activate war mode?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of Nigerian warriors committed to crushing their goals.
          </p>
          <Link
            href="/signup"
            style={{ backgroundColor: '#F9A825' }}
            className="inline-block px-10 py-5 font-bold text-black rounded-lg hover:opacity-90 transition text-lg"
          >
            Start Your Free Warrior Journey <ArrowRight className="inline ml-2" size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0A0A0A', borderTop: '1px solid #2A2A2A' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">⚔️ WARMODE</h3>
              <p className="text-gray-400">Virtual coworking for warriors in Nigeria.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Twitter</a></li>
                <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Discord</a></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #2A2A2A' }} className="pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; 2026 WarMode. All rights reserved. Go to war with your goals.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Twitter</a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
