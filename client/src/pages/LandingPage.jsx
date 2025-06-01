import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, Database, Brain, Users, FileText, Sparkles, Zap, Shield, BarChart, ChevronDown } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  // Initial space animation
  const spaceAnimation = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.8, ease: "easeOut" }
    }
  };

  // Features from README.md
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-[#FFFFFF]" />,
      title: "Natural Language Database Queries",
      description: "Ask questions about your candidate data in plain English"
    },
    {
      icon: <FileText className="w-8 h-8 text-[#FFFFFF]" />,
      title: "Automated Resume Processing",
      description: "Extract structured information from candidate resumes"
    },
    {
      icon: <Database className="w-8 h-8 text-[#FFFFFF]" />,
      title: "Intelligent Candidate Scoring",
      description: "Calculate match scores between candidates and job requirements"
    },
    {
      icon: <Users className="w-8 h-8 text-[#FFFFFF]" />,
      title: "Multi-format Support",
      description: "Process PDF resumes and job descriptions"
    }
  ];

  const benefits = [
    {
      icon: <Sparkles className="w-8 h-8 text-[#FFFFFF]" />,
      title: "AI-Powered Insights",
      description: "Get deep insights into candidate profiles using advanced AI algorithms"
    },
    {
      icon: <Zap className="w-8 h-8 text-[#FFFFFF]" />,
      title: "Lightning Fast Processing",
      description: "Process hundreds of resumes in minutes, not hours"
    },
    {
      icon: <Shield className="w-8 h-8 text-[#FFFFFF]" />,
      title: "Secure & Private",
      description: "Enterprise-grade security for your candidate data"
    },
    {
      icon: <BarChart className="w-8 h-8 text-[#FFFFFF]" />,
      title: "Data-Driven Decisions",
      description: "Make informed hiring decisions with comprehensive analytics"
    }
  ];

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene;

    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Camera position
    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.x += 0.0001;
      stars.rotation.y += 0.0001;
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] overflow-hidden">
      {/* Three.js Background */}
      <div ref={containerRef} className="fixed inset-0 z-0" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-16"
          initial="initial"
          animate="animate"
          variants={spaceAnimation}
        >
          <div className="text-center max-w-4xl flex-grow flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.3 }}
              className="w-32 h-32 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#FFFFFF]/20"
            >
              <Bot size={64} className="text-[#FFFFFF]" />
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Typewriter
                words={['Hire AI']}
                cursor
                cursorStyle='_'
                typeSpeed={70}
                deleteSpeed={50}
              />
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-[#808080] mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Transform your hiring process with AI-powered candidate analysis and intelligent insights
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#FFFFFF', color: '#000000' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat')}
              className="px-8 py-4 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-all duration-300 inline-flex items-center gap-2 text-lg font-medium border border-[#FFFFFF]"
            >
              Get Started
              <ArrowRight size={20} />
            </motion.button>
          </div>

          {/* Scroll Down Indicator */}
          <motion.div
            className="mt-auto text-[#FFFFFF] cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <ChevronDown size={32} />
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="py-16 px-4 bg-[#FFFFFF]/3 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">10x</h3>
              <p className="text-[#808080]">Faster Hiring Process</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">95%</h3>
              <p className="text-[#808080]">Accuracy in Candidate Matching</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">24/7</h3>
              <p className="text-[#808080]">AI-Powered Analysis</p>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="py-24 px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px 0px" }}
          >
            Powerful Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 bg-[#FFFFFF]/5 rounded-2xl backdrop-blur-lg border border-[#FFFFFF]/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px 0px" }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-[#FFFFFF] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-[#808080]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-24 px-4 bg-[#FFFFFF]/3 backdrop-blur-lg">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px 0px" }}
          >
            Why Choose Hire AI?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="p-8 bg-[#000000]/50 rounded-2xl backdrop-blur-lg border border-[#FFFFFF]/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px 0px" }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-[#FFFFFF] mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{benefit.title}</h3>
                <p className="text-[#808080]">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-24 px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px 0px" }}
          >
            How It Works
          </motion.h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px 0px" }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFFFFF]/20">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Data</h3>
                <p className="text-[#808080]">Upload your job description and candidate resumes</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px 0px" }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFFFFF]/20">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-[#808080]">Our AI processes and analyzes the data</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px 0px" }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFFFFF]/20">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
                <p className="text-[#808080]">Receive detailed insights and recommendations</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="py-24 px-4 text-center bg-[#FFFFFF]/3 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-8">Ready to Transform Your Hiring Process?</h2>
          <p className="text-xl text-[#808080] mb-12 max-w-2xl mx-auto">
            Join the future of recruitment with AI-powered insights and automated candidate analysis
          </p>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#FFFFFF', color: '#000000' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="px-8 py-4 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-all duration-300 inline-flex items-center gap-2 text-lg font-medium border border-[#FFFFFF]"
          >
            Start Your Journey
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Footer */}
        <footer className="py-8 px-4 text-center text-[#808080]">
          <div className="max-w-6xl mx-auto border-t border-[#FFFFFF]/10 pt-8">
            <p>&copy; 2023 Hire AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;