export const DEPARTMENTS = [
  "ACCT",
  "BAEP",
  "BUCO",
  "DSO",
  "FBE",
  "GSBA",
  "MKT",
  "MOR",
  "Non-Marshall Courses",
  "RISK",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const CAREER_CATEGORIES = [
  "Consulting",
  "Marketing",
  "Finance",
  "Product Management",
  "Strategy",
  "Technology",
  "Entertainment",
  "Operations",
  "Entrepreneurship",
  "General Management",
  "Investment Mgmt/VC/PE",
  "Other",
  "Human Resources",
  "Social Impact/Sustainability",
  "Healthcare",
  "Data/Analytics",
  "Undecided/Unsure",
  "Real Estate",
  "Business Development",
  "Program/Project Management",
  "Energy",
  "Retail/CPG",
] as const;

export type CareerCategory = (typeof CAREER_CATEGORIES)[number];

export const SEMESTERS = ["Fall", "Spring", "Summer", "Summer/Fall"] as const;

export const RECOMMENDATIONS = ["Yes", "No", "Maybe"] as const;

export const REVIEWS_PAGE_SIZE = 20;
