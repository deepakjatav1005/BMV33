import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fromRegistration = location.state?.fromRegistration;

  return (
    <div className="max-w-4xl mx-auto px-4 py-32">
      {fromRegistration && (
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-orange-600 font-bold hover:text-orange-700 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Go Back to Registration
        </button>
      )}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose max-w-none text-gray-700 space-y-6">
          <p>At Best Venue Option, we prioritize your privacy. This policy outlines how we handle your data.</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly to us during registration, such as your name, mobile number, and business details.</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <p>Your information is used to provide our services, connect you with visitors, and improve your experience on our platform.</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data from unauthorized access.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyView;
