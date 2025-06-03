import React from 'react';

const Blog: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Sample blog posts */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src="/files/background-blog.png" 
            alt="Blog post" 
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Sample Blog Post</h2>
            <p className="text-gray-600 mb-4">
              This is a sample blog post description. Click to read more.
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-800">Read More →</a>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Blog;