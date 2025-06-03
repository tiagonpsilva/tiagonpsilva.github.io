import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to My Portfolio</h1>
        <p className="text-xl text-gray-600">Software Developer & Tech Enthusiast</p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">About Me</h2>
          <p className="text-gray-700">
            I'm a passionate software developer with expertise in web development,
            focusing on creating efficient and user-friendly applications.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Skills</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>React.js</li>
            <li>TypeScript</li>
            <li>Node.js</li>
            <li>Web Development</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home;