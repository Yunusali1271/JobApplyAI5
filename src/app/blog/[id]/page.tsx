import Image from 'next/image';
import Link from 'next/link';

// This would typically come from a CMS or database
const blogPosts = {
  1: {
    title: "How to Write a Standout Cover Letter",
    content: `
      <p>Writing a compelling cover letter is an art that can significantly increase your chances of landing an interview. Here are some key tips to help you create a standout cover letter:</p>
      
      <h2>1. Start Strong</h2>
      <p>Your opening paragraph should grab the reader's attention immediately. Instead of the generic "I am writing to express my interest in...", try something more engaging that shows you've done your research.</p>
      
      <h2>2. Show Your Value</h2>
      <p>Focus on what you can bring to the company. Use specific examples from your experience that align with the job requirements.</p>
      
      <h2>3. Keep It Concise</h2>
      <p>A cover letter should be no longer than one page. Every sentence should serve a purpose and add value to your application.</p>
      
      <h2>4. Customize for Each Position</h2>
      <p>Generic cover letters are easy to spot. Take the time to research the company and position, and tailor your letter accordingly.</p>
      
      <h2>5. End with Confidence</h2>
      <p>Close your letter with a strong call to action, expressing your enthusiasm for the opportunity to discuss your qualifications further.</p>
    `,
    date: "March 24, 2024",
    readTime: "5 min read",
    image: "/blog/cover-letter.jpg",
    author: "Career Expert"
  },
  // Add more blog posts here
};

export default function BlogPost({ params }: { params: { id: string } }) {
  const post = blogPosts[params.id as unknown as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">Post not found</h1>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>{post.date}</span>
            <span className="mx-2">•</span>
            <span>{post.readTime}</span>
            <span className="mx-2">•</span>
            <span>By {post.author}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className="mt-8 pt-8 border-t">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
} 