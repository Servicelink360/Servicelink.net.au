export type FaqItem = {
  question: string;
  answer: string;
};

export const siteFaqs: FaqItem[] = [
  {
    question: "What types of facilities do you manage?",
    answer:
      "We manage civic buildings, education campuses, healthcare facilities, commercial offices, recreation complexes, and mixed public-private portfolios across Australia.",
  },
  {
    question: "How quickly can you mobilise on a new contract?",
    answer:
      "Standard mobilisation runs 6–10 weeks depending on portfolio size. Emergency transitions can be compressed with a dedicated transition team and phased handover.",
  },
  {
    question: "Do you provide real-time reporting?",
    answer:
      "Yes. Every client receives access to the Servicelink Command dashboard — live SLA tracking, work order status, asset health, and executive summaries.",
  },
  {
    question: "Are you ISO certified?",
    answer:
      "Servicelink holds ISO 9001, 14001, and 45001 certifications. All operations are audited annually with full traceability.",
  },
];
