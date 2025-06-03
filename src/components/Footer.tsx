import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-6">
        <p className="text-center">&copy; {new Date().getFullYear()} Tiago Pinto. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;