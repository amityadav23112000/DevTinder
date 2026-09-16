import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center gap-3 text-center">
        <Link to="/" className="text-xl font-bold tracking-wide hover:text-yellow-300">
          DevTinder
        </Link>
        <p className="text-sm text-white/80 max-w-sm">
          Connect with developers who share your stack.
        </p>
        <p className="text-xs text-white/60 mt-2">
          © {new Date().getFullYear()} DevTinder. Built for developers, by developers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
