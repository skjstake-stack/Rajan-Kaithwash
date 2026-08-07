import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Clock, Tag, ArrowRight, Search, Share2, Loader2 } from 'lucide-react';
import { BlogPost, Language } from '../types';
import { BLOG_POSTS } from '../data/astrologyData';
import { CleanFormattedText } from '../utils/textUtils';
import { SEOHead } from './SEOHead';

interface BlogSectionProps {
  darkMode: boolean;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ darkMode }) => {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
          const fetchedPosts: BlogPost[] = data.blogs.map((b: any) => ({
            id: b.id || b.slug,
            title: b.title,
            category: b.category || 'ज्योतिष',
            author: b.author || 'पं. राजन कैथवास',
            date: b.publish_date ? b.publish_date.split(' ')[0] : (b.date || '2026-08-01'),
            readTime: b.reading_time || b.readTime || '4 मिनट',
            imageUrl: b.featured_image_url || b.imageUrl || 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=800&q=80',
            excerpt: b.short_description || b.excerpt || '',
            content: b.content || '',
            tags: Array.isArray(b.tags) ? b.tags : ['Astrology', 'Remedies'],
          }));
          setPosts(fetchedPosts);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic blog posts, using default articles:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleReadPost = (post: BlogPost) => {
    setSelectedPost(post);
    fetch(`/api/blogs/${post.id}`).catch(() => {});
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="blog" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Dynamic SEO Head when reading post */}
      {selectedPost && (
        <SEOHead
          title={`${selectedPost.title} | आचार्य राजन कैथवास (मंटू)`}
          description={selectedPost.excerpt}
          keywords={selectedPost.tags.join(', ')}
          canonicalUrl={`/blog/${selectedPost.id}`}
          ogImage={selectedPost.imageUrl}
          ogType="article"
          structuredData={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': selectedPost.title,
            'description': selectedPost.excerpt,
            'author': {
              '@type': 'Person',
              'name': selectedPost.author || 'आचार्य राजन कैथवास (मंटू)'
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'राजन कैथवास (मंटू) - वैदिक ज्योतिष एवं आध्यात्मिक केंद्र',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://rajankaithwas.com/rajan_kaithwas.svg'
              }
            },
            'datePublished': selectedPost.date,
            'image': selectedPost.imageUrl
          }}
        />
      )}
      {/* Background Glow */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">वैदिक ज्ञान एवं ग्रह गोचर विचार</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            ज्योतिष लेख एवं <span className="text-[#D4AF37] italic">वैदिक ब्लॉग</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            राजन कैथवास (मंटू) द्वारा रचित वास्तु शास्त्र, ग्रह गोचर, कुण्डली दोष एवं रत्न धारण विधि पर प्रामाणिक लेख पढ़ें।
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-10 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#D4AF37]" />
          <input
            type="text"
            placeholder="वास्तु, कुण्डली, शनि ढैय्या, रत्न पर लेख खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 backdrop-blur-xl text-[#D4AF37] placeholder-white/40 text-xs sm:text-sm rounded-full pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] shadow-xl"
          />
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col justify-between hover:-translate-y-1.5 transition-all hover:border-[#D4AF37]/40"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-lg tracking-wider">
                    {post.category}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-4 text-[11px] text-white/50 mb-2">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
                      {post.readTime}
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#D4AF37] line-clamp-2 mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium text-white/60">लेखक: {post.author}</span>
                <button
                  onClick={() => handleReadPost(post)}
                  className="flex items-center text-xs font-bold text-[#D4AF37] hover:text-[#FF9933] cursor-pointer"
                >
                  <span>संपूर्ण लेख पढ़ें</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Article Full Reader Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#050B18] border border-[#D4AF37]/40 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

              <span className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-lg inline-block">
                {selectedPost.category}
              </span>

              <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">
                {selectedPost.title}
              </h2>

              <div className="flex items-center space-x-4 text-xs text-white/50 border-b border-white/10 pb-3">
                <span>लेखक: {selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.date}</span>
                <span>•</span>
                <span>{selectedPost.readTime}</span>
              </div>

              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                referrerPolicy="no-referrer"
                className="w-full h-56 object-cover rounded-2xl border border-white/10"
              />

              <CleanFormattedText content={selectedPost.content} className="text-[#050B18]/80 dark:text-white/80 font-sans" />

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="flex space-x-1">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-white/5 text-[#D4AF37] px-2.5 py-1 rounded-md border border-white/10">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
