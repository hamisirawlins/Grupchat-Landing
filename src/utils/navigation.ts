// An array of links for navigation bar
const navBarLinks = [
  { name: "Home", url: "/" },
  { name: "Contact Us", url: "/contact" },
  { name: "Login", url: "https://grupchat-io.vercel.app/sign-in" },
  { name: "Sign Up", url: "https://grupchat-io.vercel.app/sign-up" },
];
// An array of links for footer
const footerLinks = [
  {
    section: "Company",
    links: [
      { name: "Privacy Policy", url: "/privacy-policy" },
    ],
  },
];
// An object of links for social icons
const socialLinks = {
  facebook: "https://www.facebook.com/",
  x: "https://x.com/grupchatinfo",
  instagram: "https://www.instagram.com/grupchat.info/",
  google: "https://www.google.com/search?q=grupchatinfo&rlz=1C5CHFA_enKE1117KE1118&oq=grupchatinfo&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgNGB4yCggCEAAYCBgNGB4yDQgDEAAYhgMYgAQYigUyDQgEEAAYhgMYgAQYigUyBggFEEUYPDIGCAYQRRg8MgYIBxBFGDzSAQg0MTgyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8",
  slack: "https://slack.com/",
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};