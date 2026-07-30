export type Client = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  projects: string[];
  image?: string;
};

export const clients: Client[] = [
  {
    slug: "school-infrastructure-nsw",
    title: "School Infrastructure NSW (SINSW)",
    summary:
      "Reliable facilities services supporting safe, nurturing school environments across NSW.",
    description:
      "Our team of dedicated professionals is committed to supporting the educational mission of School Infrastructure NSW by providing reliable, high-quality services that create a safe and nurturing environment for students and staff. We take pride in our work and are dedicated to maintaining the highest standards of excellence in everything we do.",
    projects: [
      "Tree maintenance and arborist services for school grounds",
      "Grounds and landscape management",
      "Facilities maintenance and cleaning support",
    ],
  },
  {
    slug: "inner-west",
    title: "Inner West Council",
    summary:
      "Facility management for community centres, parks, aquatic centres, and public amenities.",
    description:
      "Inner West Council is known for its vibrant community and dedication to providing high-quality services to its residents. Our partnership involves managing and maintaining a variety of public facilities, including community centres, parks, and public amenities. We work closely with the council to ensure these facilities are well-maintained and provide a safe and welcoming environment for all users.",
    projects: [
      "Ashfield Aquatic Center",
      "Leichhardt Town Hall",
      "Leichhardt Oval Sportgrounds",
      "Leichhardt ELC",
      "Annandale Community Center",
      "Balmain Town Hall",
      "Enmore ELC",
      "Cavendish ELC",
      "Debrah Little ELC",
      "John McMahon ELC",
      "Yirran Gumal ELC",
      "Balmain Glasshouse",
      "Fanny Durack Aquatic Centre",
    ],
    image: "/images/clients/inner-west.jpg",
  },
  {
    slug: "bayside",
    title: "Bayside Council",
    summary:
      "Managing aquatic centres, parks, and recreational spaces across southern Sydney.",
    description:
      "Bayside Council is committed to enhancing the quality of life for its residents through excellent facilities and services. We are proud to support Bayside Council in managing their extensive range of facilities, including aquatic centres, public parks, and recreational spaces. Our team ensures that these facilities are maintained to the highest standards.",
    projects: [
      "Arncliffe Youth Centre",
      "Arncliffe Park",
      "Ador Avenue Reserve",
      "Gardiner Park",
      "Rockdale Park",
      "Scarborough Beach Park",
      "Scarborough Park Central",
      "Tongbridge Reserve",
    ],
    image: "/images/clients/bayside.jpg",
  },
  {
    slug: "hunters-hill-council",
    title: "Hunter's Hill Council",
    summary:
      "Preserving and enhancing historic and recreational council assets on Sydney's Lower North Shore.",
    description:
      "Hunter's Hill Council, with its rich heritage and strong community focus, entrusts Servicelink with the management of several key facilities. From historic buildings to modern recreational centres, we take pride in preserving and enhancing these assets. Our proactive approach ensures that council facilities are well-maintained and continually improved to meet the evolving needs of the community.",
    projects: [
      "Hunters Hill Town Hall",
      "Boronia Park Reserve",
      "Bedlam Bay Reserve",
      "Fairland Community Hall",
      "Valentia St Reserve",
      "Gladesville Reserve",
      "Riverglade Reserve",
      "Buffalo Creek Reserve",
    ],
    image: "/images/clients/hunters-hill-council-copy.jpg",
  },
];

export const clientsOverview = {
  title: "Our Clients",
  description:
    "At Servicelink, we are proud to serve a diverse and distinguished clientele that includes NSW Government and some of Sydney's most respected local councils. Our commitment to delivering exceptional facilities management services has enabled us to build strong, lasting partnerships with our clients.",
};

export function getClient(slug: string): Client | undefined {
  return clients.find((client) => client.slug === slug);
}
