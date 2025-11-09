import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Marketing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '🎯',
      title: 'Swipe Right on Bad Ideas',
      description: 'Because every terrible idea deserves a cofounder equally delusional.',
    },
    {
      icon: '🤝',
      title: 'Match with Fellow Visionaries',
      description: 'Connect with founders who share your questionable business instincts.',
    },
    {
      icon: '💬',
      title: 'Real-time Chat',
      description: 'Discuss your pivot strategies and burn rates in real-time.',
    },
    {
      icon: '🤖',
      title: 'AI-Powered Ideas',
      description: 'Let our AI generate startup ideas that are definitely not going to work.',
    },
    {
      icon: '🎭',
      title: 'Meme Feed',
      description: 'Share your startup fails with the community. Misery loves company.',
    },
    {
      icon: '🚀',
      title: 'Launch & Crash',
      description: 'Track your journey from Series A dreams to reality checks.',
    },
  ];

  const testimonials = [
    {
      name: 'Chad Techbro',
      role: 'Ex-FAANG → Failed Founder',
      text: 'Foundrly helped me find 3 cofounders for my blockchain-powered toaster startup. We raised $0 and I\'ve never been happier!',
      avatar: '👨‍💼',
    },
    {
      name: 'Sarah Disruption',
      role: 'Serial Entrepreneur (0 Exits)',
      text: 'I matched with someone who wanted to build the same "Uber for X" as me. Now we\'re competing for the same investors. 10/10!',
      avatar: '👩‍💼',
    },
    {
      name: 'Alex Pivot',
      role: 'Professional Pivoteer',
      text: 'Every time I swipe, I discover a new terrible idea. It\'s like Tinder, but the heartbreak is financial!',
      avatar: '🧑‍💻',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Bad Ideas Swiped' },
    { number: '500+', label: 'Delusional Matches' },
    { number: '$0M', label: 'Total Funding Raised' },
    { number: '∞', label: 'Pivots Executed' },
  ];

  return (
    <div className="bg-gradient-dark min-h-screen overflow-hidden">
      {/* Floating Nav */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-darkBg/95 backdrop-blur-md border-b border-gray-800"
      >
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <span className="text-4xl font-bold text-netflixRed">F</span>
            <span className="text-2xl font-semibold text-textLight">oundrly</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(229, 9, 20, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="bg-netflixRed text-white px-8 py-3 rounded-lg font-semibold"
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute w-2 h-2 bg-netflixRed rounded-full blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-6xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
            className="mb-4"
          >
            <span className="text-7xl md:text-8xl">🎬</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight px-4"
          >
            <span className="block text-textLight mb-2">Swipe Right on</span>
            <span className="block text-netflixRed">
              Bad Startup Ideas
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-textGray mb-10 max-w-3xl mx-auto px-4 leading-relaxed"
          >
            Swipe through terrible startup ideas. 
            Match with equally delusional cofounders. Build something nobody asked for. Together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(229, 9, 20, 0.7)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="bg-netflixRed text-white px-12 py-4 rounded-full font-bold text-lg"
            >
              Start Swiping →
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#E50914' }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-textGray text-textLight px-12 py-4 rounded-full font-bold text-lg hover:border-netflixRed transition"
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Floating characters */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-32 left-10 text-5xl lg:text-6xl"
            >
              💡
            </motion.div>
            <motion.div
              animate={{ y: [0, 20, 0], rotate: [5, -5, 5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-48 right-20 text-5xl lg:text-6xl"
            >
              🚀
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute bottom-48 left-20 text-5xl lg:text-6xl"
            >
              💸
            </motion.div>
            <motion.div
              animate={{ y: [0, 25, 0], rotate: [8, -8, 8] }}
              transition={{ duration: 4.5, repeat: Infinity }}
              className="absolute bottom-32 right-10 text-5xl lg:text-6xl"
            >
              📉
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="text-textGray text-sm mb-2">Scroll to explore</div>
          <div className="w-6 h-10 border-2 border-textGray rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-netflixRed rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-darkBg/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-5xl font-bold text-netflixRed mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-textGray">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center text-textLight mb-4"
          >
            Features That Don't Work
            <span className="block text-netflixRed text-3xl mt-2">(But Look Cool)</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-card rounded-2xl p-8 border border-gray-800 hover:border-netflixRed/50 transition-all cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-textLight mb-3">
                  {feature.title}
                </h3>
                <p className="text-textGray">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-darkBg/50">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center text-textLight mb-16"
          >
            What Founders Are Saying
          </motion.h2>

          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-gradient-card rounded-2xl p-12 border border-gray-800 text-center"
          >
            <div className="text-8xl mb-6">{testimonials[currentTestimonial].avatar}</div>
            <p className="text-2xl text-textLight mb-6 italic">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="text-netflixRed font-bold text-xl">
              {testimonials[currentTestimonial].name}
            </div>
            <div className="text-textGray">
              {testimonials[currentTestimonial].role}
            </div>
          </motion.div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentTestimonial ? 'bg-netflixRed' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-netflixRed/20 to-purple-600/20 blur-3xl"
        />

        <div className="container mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-6xl font-bold text-textLight mb-6"
          >
            Ready to Build Nothing?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl text-textGray mb-12"
          >
            Join thousands of founders who are confidently building the wrong thing.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(229, 9, 20, 0.8)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/login')}
            className="bg-netflixRed text-white px-16 py-5 rounded-full font-bold text-2xl shadow-glow"
          >
            Start Your Journey to Failure 🚀
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center">
          <div className="text-textLight font-bold text-2xl mb-4">Foundrly</div>
          <p className="text-textGray mb-6">
            Because every bad founder needs company.
          </p>
          <div className="flex justify-center gap-8 text-textGray text-sm">
            <a href="#" className="hover:text-netflixRed transition">About</a>
            <a href="#" className="hover:text-netflixRed transition">Terms</a>
            <a href="#" className="hover:text-netflixRed transition">Privacy</a>
            <a href="#" className="hover:text-netflixRed transition">Contact</a>
          </div>
          <p className="text-textGray text-xs mt-8">
            © 2025 Foundrly. All wrongs reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

