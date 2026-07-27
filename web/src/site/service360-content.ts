export const SERVICE360_URL = "https://service360.com.au/";

export type Service360Support = {
  slug: string;
  title: string;
  tagline: string;
  body: string[];
  capabilities: string[];
};

export const SERVICE360_SUPPORTS: Service360Support[] = [
  {
    slug: "facilities-management",
    title: "Facilities Management",
    tagline: "One system for complete portfolio control",
    body: [
      "Servicelink built Service360 and uses it every day as the operating system for facilities management — giving our teams and clients one live view of offices, retail sites, industrial properties and multi-site portfolios. From scheduled and reactive work to service requests, faults, site activity and completion records, everything is linked to the right site, service and responsible team so portfolios stay visible and accountable.",
      "The platform connects Servicelink’s hard and soft FM services, reducing reliance on emails, spreadsheets and separate contractor systems. Every activity is linked to the relevant site, service and responsible team, creating a clear chain of accountability.",
    ],
    capabilities: [
      "Centralised work and service management",
      "Multi-site portfolio visibility",
      "Scheduled and reactive task tracking",
      "Client tickets and communication",
      "Fault escalation and resolution",
      "Operational dashboards and reports",
      "Digital records and supporting evidence",
    ],
  },
  {
    slug: "general-cleaning",
    title: "General Cleaning",
    tagline: "Consistent standards supported by digital evidence",
    body: [
      "Servicelink built Service360 and uses it every day to run cleaning programs across commercial workplaces, retail facilities, warehouses, childcare centres, aged-care environments and other operational sites. Teams receive site-specific schedules, checklists and reporting requirements in the app, then close out work with time records, comments, photographs and videos — so supervisors and clients can see that cleaning standards were met.",
      "Cleaning teams receive site-specific tasks and reporting requirements through the platform. Completed work can be supported by time records, checklists, comments, photographs and videos, giving supervisors and clients greater confidence that required standards have been achieved.",
      "Structured reports help identify recurring concerns, missed requirements and opportunities for continuous improvement.",
    ],
    capabilities: [
      "Site-specific cleaning schedules",
      "Digital cleaning checklists",
      "Before-and-after photographs",
      "Video and document evidence",
      "Staff attendance and site check-in",
      "Quality and compliance reports",
      "Fault and hygiene issue reporting",
    ],
  },
  {
    slug: "ground-maintenance",
    title: "Ground Maintenance",
    tagline: "Year-round scheduling and site visibility",
    body: [
      "Servicelink built Service360 and uses it every day to plan and deliver ground maintenance across lawns, gardens, pathways, car parks and outdoor common areas. Recurring programs are organised by site, service and frequency, while field teams record completed work and raise hazards — damaged irrigation, fallen branches, unsafe paths or vegetation affecting access — so facility managers have a clear outdoor service history.",
      "Field teams can document completed activities and report hazards such as damaged irrigation, fallen branches, unsafe pathways or vegetation affecting access. Facility managers receive a reliable record of work performed and any follow-up action required.",
    ],
    capabilities: [
      "Recurring maintenance schedules",
      "Site and service-based task allocation",
      "Photo and video completion evidence",
      "Hazard and fault reporting",
      "Urgent issue escalation",
      "Attendance and check-in records",
      "Historical service reporting",
    ],
  },
  {
    slug: "tree-lopping-and-trees-assessments",
    title: "Tree Services and Management",
    tagline: "Documented work, risks and outcomes",
    body: [
      "Servicelink built Service360 and uses it every day to coordinate tree services with the records, risk detail and evidence those works require. Inspections, pruning, removals, stump grinding, hazard identification and emergency response are tracked in one digital trail, with site notes, priority, photographs, videos and supporting documents available for clients, insurers and compliance reviews.",
      "Reports can include site information, descriptions, priority, photographs, videos and supporting documents. This helps Servicelink communicate risks clearly, coordinate follow-up work and preserve evidence for clients, insurers or compliance reviews.",
    ],
    capabilities: [
      "Tree hazard and condition reports",
      "Priority and urgent fault classification",
      "Photo and video documentation",
      "Arborist report attachments",
      "Work assignment and status tracking",
      "Follow-up action management",
      "Complete service history by site",
    ],
  },
  {
    slug: "asset-management",
    title: "Asset Management",
    tagline: "Condition, history and lifecycle decisions in one place",
    body: [
      "Servicelink built Service360 and uses it every day for asset management across the portfolios we maintain — HVAC plant, electrical boards, fire equipment, pumps, lifts, building services and other site infrastructure. Each asset carries its own condition notes, inspection outcomes, service intervals, fault history and completed work, linked to the correct site and location. That gives facility and asset managers a live register of what is installed, how it is performing, what has failed before, and when planned maintenance or replacement should be considered — instead of tracking assets across disconnected spreadsheets and folders.",
      "Facility managers can use these records to support maintenance planning, condition reviews, compliance reporting and future replacement decisions. Instead of relying on disconnected files, Service360 links operational evidence — photographs, documents, fault trails and completed works — to the relevant site and asset context over the full service lifecycle.",
    ],
    capabilities: [
      "Central asset records",
      "Condition and inspection reporting",
      "Maintenance history",
      "Fault history and recurring issue visibility",
      "Supporting photos and documents",
      "Planned maintenance tracking",
      "Compliance and lifecycle evidence",
    ],
  },
  {
    slug: "maintenance-services",
    title: "Maintenance Services",
    tagline: "From urgent fault through to verified completion on site",
    body: [
      "Servicelink built Service360 and uses it every day to coordinate programmed maintenance and reactive building repairs across plumbing, electrical, carpentry, painting, HVAC and related trades. Faults can be raised with descriptions and media, then prioritised, assigned and tracked through to verified completion — so urgent issues stay visible and every site keeps a clear repair history.",
      "Clients and site teams can report faults with descriptions and media evidence. Servicelink can then assess priority, assign responsibility, track progress and document the completed outcome. Urgent issues remain visible throughout the process, reducing the risk of missed requests or unclear ownership.",
      "The result is a transparent workflow from initial notification through response, repair and final reporting.",
    ],
    capabilities: [
      "Reactive fault reporting",
      "Planned and preventive maintenance",
      "Priority and urgency controls",
      "Task assignment and delegation",
      "Status tracking from pending to completed",
      "Photos, videos and documents",
      "Client updates and communication",
      "Completion and resolution records",
    ],
  },
  {
    slug: "roof-gutter-solar-cleaning",
    title: "Roof, Gutter and Solar Cleaning",
    tagline: "Safe, documented rooftop service delivery",
    body: [
      "Servicelink built Service360 and uses it every day to plan and prove specialist rooftop work — scheduled roof, gutter and solar cleaning across commercial and multi-site portfolios. Teams record attendance, capture before-and-after media, note drainage or access concerns, and document completed service so facility and asset managers have clear evidence of delivery and any defects needing follow-up.",
      "Teams can record site attendance, submit photographs or videos, identify drainage or access concerns and document completed work. Reports provide facility and asset managers with evidence of service delivery and visibility of any defects requiring further attention.",
    ],
    capabilities: [
      "Seasonal and recurring schedules",
      "Site check-in and attendance",
      "Before-and-after media evidence",
      "Roof and gutter condition reporting",
      "Solar panel service records",
      "Hazard and access issue reporting",
      "Downloadable client reports",
    ],
  },
  {
    slug: "support-services",
    title: "Support Services",
    tagline: "One channel for requests, coordination and communication",
    body: [
      "Servicelink built Service360 and uses it every day as the digital helpdesk between our teams and clients. Tickets, fault reports, messages, project follow-up and shared documents live in one channel — so requests are not lost in email, ownership stays clear, and clients can track progress without chasing updates across separate systems.",
      "The platform also supports project coordination, service follow-up and document sharing. Invoices and associated files can be published securely to the relevant customer organisation, creating a more organised client experience.",
    ],
    capabilities: [
      "Central client helpdesk",
      "Service tickets and requests",
      "Direct messaging and updates",
      "Project and follow-up coordination",
      "Shared reports and documents",
      "Secure invoice access",
      "Clear ownership and status visibility",
    ],
  },
];

export const SERVICE360_ACCOUNTABILITY = [
  "Work orders and scheduled tasks",
  "Preventive and reactive maintenance",
  "Fault and incident reporting",
  "Client tickets and messaging",
  "Site check-in and staff attendance",
  "Audits, inspections and action plans",
  "Photo and video evidence",
  "Training, induction and PPE records",
  "Asset management and compliance",
  "Invoices and shared documents",
  "Downloadable reports and operational history",
];

export const SERVICE360_FLOW = [
  "Request",
  "Assign",
  "Attend",
  "Complete",
  "Verify",
  "Report",
] as const;

/** Short blurb for service detail pages */
export function getService360Blurb(slug: string): { tagline: string; text: string } {
  const match = SERVICE360_SUPPORTS.find((item) => item.slug === slug);
  if (match) {
    return {
      tagline:
        "Service360 — our own operations app, built by Servicelink and used by our teams to deliver and prove every service.",
      text: match.body[0],
    };
  }
  return {
    tagline:
      "Service360 — our own operations app, built by Servicelink and used by our teams to deliver and prove every service.",
    text: "We use it to plan, deliver and prove work across facilities management, asset management, cleaning, grounds, maintenance and support services — with a complete record for every site.",
  };
}
