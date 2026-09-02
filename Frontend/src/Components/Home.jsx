import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaCode, FaUsers, FaComments } from "react-icons/fa";

const features = [
  {
    icon: <FaCode className="text-3xl text-primary" />,
    title: "Showcase Your Skills",
    description: "Build a developer profile around your stack, projects, and experience.",
  },
  {
    icon: <FaUsers className="text-3xl text-secondary" />,
    title: "Discover Developers",
    description: "Swipe through a feed of developers filtered to skip anyone you've already met.",
  },
  {
    icon: <FaComments className="text-3xl text-accent" />,
    title: "Connect & Collaborate",
    description: "Send a request, get accepted, and start talking about what you're building.",
  },
];

const Home = () => {
  const user = useSelector((store) => store.user);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          DevTinder
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-xl mx-auto text-white/90">
          Swipe, match, and connect with developers who share your stack.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {user ? (
            <Link to="/feed" className="btn btn-lg bg-white text-indigo-700 hover:bg-white/90 border-none">
              Go to Feed
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-lg bg-white text-indigo-700 hover:bg-white/90 border-none">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-lg btn-outline text-white border-white hover:bg-white/10">
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-base-100">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-base-200">
              {feature.icon}
              <h3 className="text-lg font-semibold text-base-content">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
