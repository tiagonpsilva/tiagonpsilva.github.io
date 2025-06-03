import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Tiago Pinto</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-gray-600">Home</Link>
            <Link to="/blog" className="hover:text-gray-600">Blog</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;