import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Marketing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [activeFeature, setActiveFeature] = useState(0);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const features = [
    {
      title: 'Swipe Through Ideas',
      description: 'Tinder for startup ideas. Swipe right on the ones that make you go "wait, that could actually work... or not."',
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-64 h-80 bg-gradient-to-br from-netflixRed/20 to-purple-600/20 rounded-2xl border-2 border-netflixRed/50 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-6xl font-bold text-textLight">?</span>
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Match & Connect',
      description: 'When two founders like the same terrible idea, magic happens. Or at least an awkward Zoom call.',
      visual: (
        <div className="relative w-full h-full flex items-center justify-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 bg-gradient-to-br from-netflixRed to-pink-600 rounded-full"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-4xl text-netflixRed"
          >
            ♥
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"
          />
        </div>
      ),
    },
    {
      title: 'Chat Real-time',
      description: 'Discuss your brilliant (terrible) ideas in real-time. Share your runway anxiety together.',
      visual: (
        <div className="relative w-full h-full flex flex-col justify-center gap-3 px-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
              className="bg-netflixRed/30 backdrop-blur-sm rounded-lg p-4 border border-netflixRed/50"
            >
              <div className="h-2 bg-textLight/50 rounded w-3/4"></div>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: 'AI-Generated Ideas',
      description: 'Our AI generates startup ideas so bad, they might just work. Or more likely, they won\'t.',
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="relative w-48 h-48"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-netflixRed rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-80px)`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-netflixRed to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-textLight">AI</span>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const stats = [
    { number: '10K+', label: 'Bad Ideas' },
    { number: '500+', label: 'Matches Made' },
    { number: '$0M', label: 'Raised' },
    { number: '∞', label: 'Pivots' },
  ];

  const testimonials = [
    {
      quote: "I found my cofounder in 3 swipes. We're now building an app nobody asked for. Perfect match.",
      author: "Alex Chen",
      role: "Failed Founder",
    },
    {
      quote: "The AI suggested 'Uber for Plants'. I'm now $50k in debt. Thanks Foundrly!",
      author: "Sarah Martinez",
      role: "Serial Entrepreneur",
    },
    {
      quote: "Best way to meet people who are equally bad at business. 10/10 would fail again.",
      author: "Mike Johnson",
      role: "Professional Pivoteer",
    },
  ];

  return (
    <div className="bg-black min-h-screen">
      {/* Floating Nav */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-900"
      >
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <motion.div
            whileHover={{ opacity: 0.8 }}
            onClick={() => navigate('/')}
            className="text-2xl font-light tracking-tight text-textLight cursor-pointer"
          >
            found<span className="text-netflixRed">r</span>ly
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="bg-netflixRed text-white px-6 py-2.5 rounded-md font-medium text-sm hover:bg-netflixRed/90 transition"
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-darkBg to-black" />
        
        {/* Animated red specks */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-netflixRed/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-netflixRed/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="text-sm uppercase tracking-widest text-netflixRed font-medium">
              Because every bad founder needs company
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-light tracking-tight text-textLight mb-8 leading-none"
          >
            Find your <span className="text-netflixRed">cofounder</span><br />
            <span className="text-3xl md:text-4xl text-textLight">for the next dumb unicorn</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-textGray mb-12 max-w-2xl mx-auto"
          >
            Swipe through terrible startup ideas. Match with equally delusional founders. 
            Build something together. Probably fail. Repeat.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(229, 9, 20, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="bg-netflixRed text-white px-10 py-4 rounded-md font-medium text-lg"
            >
              Start Swiping
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border border-textGray/30 text-textLight px-10 py-4 rounded-md font-medium text-lg hover:border-textGray/60 transition"
            >
              See How It Works
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-netflixRed/0 via-netflixRed to-netflixRed/0" />
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-darkBg/50 border-y border-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-light text-netflixRed mb-2">
                  {stat.number}
                </div>
                <div className="text-textGray text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-light text-textLight mb-4">
              How it works
            </h2>
            <p className="text-textGray text-lg">
              Four simple steps to startup failure
            </p>
          </motion.div>

          <div className="space-y-32">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="mb-4">
                    <span className="text-netflixRed text-sm font-medium uppercase tracking-widest">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-4xl font-light text-textLight mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-textGray text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className={`h-96 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  {feature.visual}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-darkBg/30">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-light text-textLight text-center mb-20"
          >
            What founders are saying
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-b from-cardBg to-darkBg border border-gray-800 rounded-lg p-8 hover:border-netflixRed/30 transition-all"
              >
                <div className="mb-6">
                  <svg className="w-8 h-8 text-netflixRed" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-textLight text-lg mb-6 leading-relaxed">
                  {testimonial.quote}
                </p>
                <div>
                  <div className="text-textLight font-medium">{testimonial.author}</div>
                  <div className="text-textGray text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-netflixRed/5 to-black" />
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-light text-textLight mb-8"
          >
            Ready to fail together?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-textGray mb-12"
          >
            Join thousands of delusional founders building the wrong thing, together.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(229, 9, 20, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="bg-netflixRed text-white px-12 py-5 rounded-md font-medium text-xl"
          >
            Get Started for Free
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-900">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-textLight font-light text-2xl tracking-tight">
              found<span className="text-netflixRed">r</span>ly
            </div>

            <div className="flex gap-8 text-textGray text-sm">
              <a href="#" className="hover:text-textLight transition">About</a>
              <a href="#" className="hover:text-textLight transition">Terms</a>
              <a href="#" className="hover:text-textLight transition">Privacy</a>
              <a href="#" className="hover:text-textLight transition">Contact</a>
            </div>
          </div>

          <div className="text-center mt-12 text-textGray text-sm">
            © 2025 Foundrly. All wrongs reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
