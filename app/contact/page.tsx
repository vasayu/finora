"use client"

import React, { useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const FinancialConsultation = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    companyName: '',
    executiveRole: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen mt-25 bg-black text-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Let's Build Financial <span className="text-orange-500">Clarity</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Elevate your enterprise strategy with AI-driven CFO intelligence.
          </p>
          <p className="text-gray-400 text-sm sm:text-base">
            Request a personalized consultation with our executive team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Alexander Harris"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Work Email</label>
                <input
                  type="email"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                  placeholder="alexander@company.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Acme Corporation"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Executive Role */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Executive Role</label>
                <select
                  name="executiveRole"
                  value={formData.executiveRole}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Chief Financial Officer</option>
                  <option value="ceo">Chief Executive Officer</option>
                  <option value="cfo">Chief Financial Officer</option>
                  <option value="coo">Chief Operating Officer</option>
                  <option value="cto">Chief Technology Officer</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share your key financial challenges and strategic priorities..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Request Strategic Consultation
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Trust Badge */}
            <div className="text-center text-xs text-gray-500 mt-8">
              TRUSTED BY FORTUNE 500 FINANCIAL LEADERS
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-6">Enterprise Access</h3>

              {/* Email Support */}
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Mail className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">EMAIL SUPPORT</p>
                  <a href="mailto:executive@finora.ai" className="text-white hover:text-orange-500 transition-colors">
                    executive@finora.ai
                  </a>
                </div>
              </div>

              {/* Direct Line */}
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Phone className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">DIRECT LINE</p>
                  <a href="tel:+16881234567" className="text-white hover:text-orange-500 transition-colors">
                    +1 (888) FINORA-AI
                  </a>
                </div>
              </div>

              {/* Headquarters */}
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">HEADQUARTERS</p>
                  <p className="text-white">One Financial Plaza, Palo Alto, CA</p>
                </div>
              </div>
            </div>

            {/* Neural Processing Badge */}
            <div className="bg-zinc-900 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <p className="text-orange-500 text-sm font-semibold mb-1">NEURAL PROCESSING ACTIVE</p>
                  <p className="text-gray-400 text-xs">
                    Analyzing global market vectors to optimize your consultation agenda in real-time.
                  </p>
                </div>
              </div>

              {/* Executive Avatar */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                  SM
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Strategic Lead</p>
                  <p className="text-gray-400 text-xs">Marcus West</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Logos */}
        <div className="mt-16 flex justify-center gap-8 opacity-30">
          <div className="w-16 h-16 bg-zinc-800 rounded"></div>
          <div className="w-16 h-16 bg-zinc-800 rounded"></div>
          <div className="w-16 h-16 bg-zinc-800 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default FinancialConsultation;