// One-time data script: wipes all users + connection requests, then seeds
// ~50 realistic-looking developer profiles via the real signup/login/edit
// API flow (so all the usual validation runs, exactly like a real signup).
// Run with: node scripts/reseed-fake-users.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user");
const ConnectionRequest = require("../src/models/connectionRequest");

const BASE_URL = `http://localhost:${process.env.PORT || 1234}`;
const PASSWORD = "DevPass1!";

const FIRST_NAMES = [
  "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Karan", "Isha", "Arjun", "Meera",
  "Aditya", "Kavya", "Rahul", "Divya", "Siddharth", "Neha", "Aryan", "Pooja", "Vivek", "Riya",
  "Nikhil", "Shreya", "Manish", "Tanvi", "Rajesh", "Ritika", "Sahil", "Aditi", "Varun", "Simran",
  "Akash", "Nisha", "Harsh", "Swati", "Gaurav", "Anjali", "Kunal", "Preeti", "Yash", "Deepika",
  "Amit", "Sonal", "Rohit", "Kritika", "Suresh", "Megha", "Abhishek", "Payal", "Devansh", "Ishita",
];
const LAST_NAMES = [
  "Sharma", "Patel", "Verma", "Iyer", "Rao", "Gupta", "Mehta", "Nair", "Singh", "Joshi",
  "Kumar", "Reddy", "Agarwal", "Bhatt", "Chatterjee", "Das", "Desai", "Ghosh", "Kapoor", "Malhotra",
  "Menon", "Mishra", "Pillai", "Rastogi", "Saxena", "Shah", "Trivedi", "Yadav", "Bansal", "Chawla",
];

const SKILL_STACKS = [
  ["Node.js", "Express", "MongoDB", "Docker"],
  ["React", "TypeScript", "Tailwind CSS", "Redux"],
  ["Python", "Django", "PostgreSQL", "Redis"],
  ["React Native", "Firebase", "GraphQL"],
  ["Go", "Kubernetes", "Docker", "AWS"],
  ["Vue.js", "GraphQL", "Node.js"],
  ["Java", "Spring Boot", "MySQL", "Kafka"],
  ["Python", "PyTorch", "Machine Learning", "Pandas"],
  ["Rust", "Systems Programming", "WebAssembly"],
  ["Node.js", "React", "AWS", "PostgreSQL"],
  ["Swift", "iOS", "SwiftUI"],
  ["Kotlin", "Android", "Jetpack Compose"],
  ["C++", "Competitive Programming", "Algorithms"],
  ["Angular", "TypeScript", "RxJS"],
  ["PHP", "Laravel", "MySQL"],
  ["Ruby", "Ruby on Rails", "PostgreSQL"],
  ["Scala", "Akka", "Apache Spark"],
  ["Solidity", "Ethereum", "Web3.js"],
  ["Terraform", "AWS", "CI/CD", "DevOps"],
  ["Flutter", "Dart", "Firebase"],
];

const ABOUT_TEMPLATES = [
  (skills) => `Software engineer passionate about ${skills[0]} and ${skills[1]}. Always shipping something new.`,
  (skills) => `Building scalable systems with ${skills[0]}. Open source contributor in my free time.`,
  (skills) => `${skills[0]} enthusiast who loves clean code and good coffee.`,
  (skills) => `Currently deep in ${skills[0]} and ${skills[1]}. Looking to connect with fellow developers.`,
  (skills) => `Full-stack developer with a soft spot for ${skills[0]}. Let's build something together.`,
];

const ORGANIZATIONS = [
  "Google", "Microsoft", "Amazon", "Flipkart", "Zomato", "Swiggy", "Razorpay", "Freshworks",
  "Paytm", "CRED", "Zerodha", "Meesho", "Uber", "Atlassian", "Adobe", "Salesforce",
  "IIT Delhi", "IIT Bombay", "IIT Madras", "BITS Pilani", "NIT Trichy", "IIIT Hyderabad",
  "VIT Vellore", "Delhi University", "Anna University", "startup (stealth mode)",
];

const DEGREES = ["B.Tech Computer Science", "B.Tech IT", "M.Tech Computer Science", "B.Sc Computer Science", "MCA", "B.E. Electronics"];
const INSTITUTIONS = ["IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani", "VIT Vellore", "IIIT Hyderabad", "Delhi University", "Anna University"];

const GENDERS = ["male", "female", "others"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildUser(idx) {
  const firstName = FIRST_NAMES[idx % FIRST_NAMES.length];
  const lastName = rand(LAST_NAMES);
  const skills = rand(SKILL_STACKS);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idx}@example.com`;
  const age = randInt(21, 40);
  const gender = rand(GENDERS);
  const about = rand(ABOUT_TEMPLATES)(skills);
  const organization = rand(ORGANIZATIONS);
  const hasEducation = Math.random() > 0.2;
  const education = hasEducation
    ? [{ degree: rand(DEGREES), institution: rand(INSTITUTIONS), year: randInt(2014, 2024) }]
    : [];

  return { firstName, lastName, email, age, gender, about, skills, organization, education };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const deletedUsers = await User.deleteMany({});
  const deletedRequests = await ConnectionRequest.deleteMany({});
  console.log(`Cleared ${deletedUsers.deletedCount} users and ${deletedRequests.deletedCount} connection requests.`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB — seeding via the live API now.");

  let created = 0;
  for (let i = 0; i < 50; i++) {
    const u = buildUser(i);

    const signupRes = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: PASSWORD,
        age: u.age,
        skills: u.skills,
        about: u.about,
        organization: u.organization,
      }),
    });

    if (signupRes.status !== 201) {
      const body = await signupRes.json();
      console.log(`FAILED signup for ${u.email}:`, body);
      continue;
    }

    // Log in to get a cookie, then PATCH the fields signup doesn't accept (gender, education)
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: u.email, password: PASSWORD }),
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookie = (setCookie.match(/token=([^;]*)/) || [])[0];

    if (cookie) {
      await fetch(`${BASE_URL}/profile/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          firstName: u.firstName,
          lastName: u.lastName,
          about: u.about,
          skills: u.skills,
          organization: u.organization,
          gender: u.gender,
          education: u.education,
        }),
      });
    }

    created++;
    if (created % 10 === 0) console.log(`Seeded ${created}/50...`);
  }

  console.log(`Done. Created ${created}/50 fake users. Password for all: ${PASSWORD}`);
}

main().catch((error) => {
  console.error("Reseed failed:", error);
  process.exit(1);
});
