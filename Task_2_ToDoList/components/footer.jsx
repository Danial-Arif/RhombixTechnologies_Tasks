export default function Footer({ isDarkMode }) {
  return (
    <footer className={`fixed bottom-0 left-0 w-full border-t backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? 'bg-[#020617]/40 border-white/10' : 'bg-white/60 border-gray-200'}`}>
      <div className={`max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        
        <p className="text-center sm:text-left">
          © 2026 Danial Arif. All rights reserved.
        </p>

        <p className="text-center sm:text-right">
          Made with <span className="text-red-500">❤️</span> by Danial Arif
        </p>

      </div>
    </footer>
  );
}