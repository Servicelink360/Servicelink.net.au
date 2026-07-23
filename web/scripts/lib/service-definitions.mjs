/**
 * Canonical service metadata used by Gemini seed scripts.
 * seoSlug = URL segment on /locations/{city}/{seoSlug}
 * staticSlug = URL segment on /services/{staticSlug}
 */
export const SERVICE_DEFINITIONS = [
  {
    seoSlug: "asset-management",
    staticSlug: "asset-management",
    name: "Asset Management",
    focus:
      "Asset registers, condition assessments, lifecycle planning, and compliance reporting for commercial portfolios.",
  },
  {
    seoSlug: "facilities-management",
    staticSlug: "facilities-management",
    name: "Facilities Management",
    focus:
      "Integrated hard and soft FM for commercial offices, retail, industrial, healthcare, education, and multi-site portfolios.",
  },
  {
    seoSlug: "cleaning",
    staticSlug: "general-cleaning",
    name: "General Cleaning",
    focus:
      "Presentation-ready workplace cleaning for offices, retail, warehouses, childcare, and aged care with audit-ready standards.",
  },
  {
    seoSlug: "ground-maintenance",
    staticSlug: "ground-maintenance",
    name: "Ground Maintenance",
    focus:
      "Lawns, gardens, car parks, and open spaces kept safe and presentable year-round for commercial sites.",
  },
  {
    seoSlug: "tree-services",
    staticSlug: "tree-lopping-and-trees-assessments",
    name: "Tree Services and Management",
    focus:
      "Qualified arborists for pruning, removals, hazard management, and arborist reporting on commercial properties.",
  },
  {
    seoSlug: "maintenance",
    staticSlug: "maintenance-services",
    name: "Maintenance Services",
    focus:
      "Reactive and programmed building maintenance — plumbing, electrical, carpentry, HVAC — with 24/7 make-safe response.",
  },
  {
    seoSlug: "roof-gutter-solar-cleaning",
    staticSlug: "roof-gutter-solar-cleaning",
    name: "Roof, Gutter & Solar Cleaning",
    focus:
      "Commercial roof, gutter, and solar panel cleaning — safe height work, drainage protection, and panel efficiency.",
  },
  {
    seoSlug: "support-services",
    staticSlug: "support-services",
    name: "Support Services",
    focus:
      "Procurement, project coordination, refurbishments, helpdesk, and back-office FM support.",
  },
];

export function getServiceDefinitionBySeoSlug(seoSlug) {
  return SERVICE_DEFINITIONS.find((service) => service.seoSlug === seoSlug);
}
