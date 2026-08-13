export const site = {
  name: "Servicelink Facilities Management",
  tagline:
    "Partner in facilities management — excellence in service to our communities with care and passion.",
  description:
    "Integrated facilities management for businesses across Sydney and NSW — cleaning, maintenance, grounds care, and more.",
  url: "https://www.servicelink.net.au",
  contact: {
    phone: "0420 220 220",
    serviceNumber: "0420220220",
    serviceNumberDisplay: "0420 220 220",
    email: "helpdesk@servicelink.net.au",
    location: "Sydney, NSW",
    officeLabel: "Support Office",
  },
  stats: [
    { value: "194+", label: "Active sites under management" },
    { value: "20", label: "Different nationalities within our workforce" },
    { value: "8+", label: "Years of growth and successful business" },
  ],
  certifications: [
    "ISO 9001:2015 Quality Management System",
    "ISO 14001:2015 Environmental Management System",
    "ISO 45001:2018 Occupational Health and Safety Management System",
    "Southpac Certifications",
    "Conserve Certificate No: BNG/CMS/24/01798",
  ],
  clients: [
    "School Infrastructure NSW (SINSW)",
    "Inner West Council",
    "Bayside Council",
    "Hunter's Hill Council",
  ],
} as const;

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/contact", label: "Contact" },
] as const;

/** Fallback state links in the Locations nav if city data is unavailable. */
export const locationStateLinks = [
  { href: "/locations?state=NSW", label: "NSW" },
  { href: "/locations?state=VIC", label: "VIC" },
  { href: "/locations?state=QLD", label: "QLD" },
  { href: "/locations?state=WA", label: "WA" },
  { href: "/locations?state=SA", label: "SA" },
] as const;

export const heroSlides = [
  {
    title: "Sport Grounds Facilities Management",
    subtitle: "Managed by Servicelink",
    image: "/images/oval-1.jpg",
  },
  {
    title: "Aquatic Centres Facilities Management",
    subtitle: "Managed by Servicelink",
    gradient: "from-teal-800 via-teal-700 to-emerald-600",
  },
  {
    title: "Childcare Facilities Management",
    subtitle: "Managed by Servicelink",
    gradient: "from-slate-900 via-slate-800 to-teal-900",
  },
  {
    title: "Landmark Buildings Facilities Management",
    subtitle: "Managed by Servicelink",
    gradient: "from-emerald-900 via-green-800 to-teal-800",
  },
  {
    title: "Community Centres Facilities Management",
    subtitle: "Managed by Servicelink",
    gradient: "from-blue-950 via-slate-900 to-teal-900",
  },
] as const;
