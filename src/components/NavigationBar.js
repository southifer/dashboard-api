import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const { pathname } = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  return (
    <nav className="bg-[#0F1015] border-b-2 border-[#181A20] text-white p-4 flex items-center justify-between lg:justify-between flex-col lg:flex-row top-0 left-0 right-0 z-50 max-w-screen">
      {/* Toggle Button for Small Screens */}
      <button
        className="lg:hidden absolute right-4 top-4 p-2 rounded-lg text-white focus:outline-none"
        onClick={toggleNav}
        aria-label="Toggle Navigation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Logo and Navigation Links */}
      <div className="flex items-center w-full lg:w-auto">
        <img
          src="https://komikkamvret.com/wp-content/uploads/2020/11/Tiers1-PNG.png"
          alt="Logo"
          className="w-12 h-12 rounded-full object-cover"
        />
        <span className="ml-4 text-xl font-semibold">Noir'e</span>
      </div>

      {/* Navigation Links */}
      <div className={`lg:flex ${isNavOpen ? 'block' : 'hidden'} lg:flex lg:space-x-4 lg:ml-auto flex-col lg:flex-row space-y-2 lg:space-y-0 mt-4 lg:mt-0 w-full lg:w-auto`}>
        <Link
          to="/"
          className={`flex items-center px-4 py-2 rounded-lg ${pathname === '/' ? 'bg-[#272B34]' : 'hover:bg-[#272B34]'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 mr-2 ${pathname === '/' ? 'text-[#22D3EE]' : 'text-white'}`}
          >
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </svg>
          dashboard
        </Link>
        <Link
          to="/dashboard"
          className={`flex items-center px-4 py-2 rounded-lg ${pathname === '/dashboard' ? 'bg-[#272B34]' : 'hover:bg-[#272B34]'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 mr-2 ${pathname === '/dashboard' ? 'text-[#22D3EE]' : 'text-white'}`}
          >
            <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z" clipRule="evenodd" />
          </svg>
          controller
        </Link>
        <Link
          to="/world"
          className={`flex items-center px-4 py-2 rounded-lg ${pathname === '/world' ? 'bg-[#272B34]' : 'hover:bg-[#272B34]'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 mr-2 ${pathname === '/world' ? 'text-[#22D3EE]' : 'text-white'}`}
          >
            <path d="M15.75 8.25a.75.75 0 0 1 .75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 1 1-.992-1.124A2.243 2.243 0 0 0 15 9a.75.75 0 0 1 .75-.75Z" />
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM4.575 15.6a8.25 8.25 0 0 0 9.348 4.425 1.966 1.966 0 0 0-1.84-1.275.983.983 0 0 1-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 0 1 2.328-.377L16.5 15h.628a2.25 2.25 0 0 1 1.983 1.186 8.25 8.25 0 0 0-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.575 15.6Z" clipRule="evenodd" />
          </svg>
          world
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
