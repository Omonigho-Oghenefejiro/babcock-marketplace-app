import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold">Babcock Campus Marketplace</h3>
            <p className="text-gray-400 text-sm">The official trading hub for students.</p>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Support</a>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Babcock University.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;