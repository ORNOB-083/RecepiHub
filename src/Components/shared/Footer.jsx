"use client";
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'; 
import { BiTime } from 'react-icons/bi';
import { UtensilsCrossed } from 'lucide-react'; // Elegant layout er jonno dynamic icon

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-[#DFD0BD]/60 dark:border-zinc-800 text-gray-600 dark:text-gray-400 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Contact Info Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2 group">
                {/* Dynamic Icon Logo replacing static /logo.png */}
                <div className="p-2 bg-[#F5726B]/10 rounded-xl text-[#F5726B] group-hover:bg-[#F5726B] group-hover:text-white transition-all duration-300">
                  <UtensilsCrossed size={20} className="shrink-0" />
                </div>
                <h2 className="text-2xl font-extrabold text-black dark:text-white transition-colors">
                  Recipe<span className="text-[#F5726B]">Hub</span>
                </h2>
              </Link>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
              Discover, create, and share your favorite recipes with a global community of food lovers. Your ultimate culinary companion.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 text-sm">
                <MdPhone className="text-[#F5726B] text-base shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 hover:text-[#AE514B] dark:hover:text-[#F5726B] transition">+880 1700 000000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MdEmail className="text-[#F5726B] text-base shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 hover:text-[#AE514B] dark:hover:text-[#F5726B] transition">support@recipehub.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MdLocationOn className="text-[#F5726B] text-base shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BiTime className="text-[#F5726B] text-base shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">24/7 Chef Support</span>
              </div>
            </div>
          </div>

          {/* Useful Links Column */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-4 relative inline-block uppercase tracking-wider">
              Explore Links
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#F5726B] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {['Home', 'Browse Recipes', 'Categories', 'About Us'].map((item) => {
                const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
                return (
                  <li key={item}>
                    <Link href={path} className="text-gray-600 dark:text-gray-400 hover:text-[#AE514B] dark:hover:text-[#F5726B] transition text-sm flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#F5726B] transition-all"></span>
                      {item}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Account Links Column */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-4 relative inline-block uppercase tracking-wider">
              Dashboard
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#F5726B] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Login', path: '/login' },
                { name: 'Register', path: '/register' },
                { name: 'My Dashboard', path: '/dashboard' },
                { name: 'Submit a Recipe', path: '/dashboard/add-recipe' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="text-gray-600 dark:text-gray-400 hover:text-[#AE514B] dark:hover:text-[#F5726B] transition text-sm flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-[#F5726B] transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social Links Column */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-4 relative inline-block uppercase tracking-wider">
              Stay Connected
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#F5726B] rounded-full"></span>
            </h3>
            
            {/* Social Media Icons */}
            <div className="flex gap-3 mb-6">
              {[
                { icon: <FaFacebookF size={16} />, url: "https://facebook.com" },
                { icon: <FaTwitter size={16} />, url: "https://twitter.com" },
                { icon: <FaInstagram size={16} />, url: "https://instagram.com" },
                { icon: <FaLinkedinIn size={16} />, url: "https://linkedin.com" },
                { icon: <FaYoutube size={16} />, url: "https://youtube.com" }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-100 dark:bg-zinc-900 border border-[#DFD0BD]/40 dark:border-zinc-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[#F5726B] dark:hover:bg-[#F5726B] hover:text-white dark:hover:text-white transition-all duration-300 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Newsletter Subscription */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Subscribe to get delicious weekly meal plans, top recipes, and premium updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-[#DFD0BD] dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#F5726B] dark:focus:border-[#F5726B] transition"
                />
                <button className="px-4 py-2 bg-[#F5726B] text-white text-sm font-semibold rounded-lg hover:bg-[#AE514B] transition cursor-pointer shadow-sm whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Safe & Secure Payments</p>
              <div className="flex gap-2">
                {['bKash', 'Nagad', 'Visa', 'MasterCard'].map((payment, index) => (
                  <div key={index} className="px-2 py-0.5 bg-gray-50 dark:bg-zinc-900 border border-[#DFD0BD]/60 dark:border-zinc-800 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider">{payment}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#DFD0BD]/40 dark:border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            &copy; {currentYear} RecipeHub. All rights reserved.
          </p>
          
          <div className="flex gap-6 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((policy) => (
              <Link 
                key={policy} 
                href={`/${policy.toLowerCase().replace(' ', '-')}`} 
                className="text-gray-400 dark:text-gray-500 hover:text-[#AE514B] dark:hover:text-[#F5726B] transition"
              >
                {policy}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;