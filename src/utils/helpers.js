export const getScoreTier = (score) => {
  if (score <= 200) return { label: "Beginner", color: "#666" };
  if (score <= 400) return { label: "Developing", color: "#4A9EFF" };
  if (score <= 600) return { label: "Proficient", color: "#00FF94" };
  if (score <= 800) return { label: "Advanced", color: "#7B61FF" };
  return { label: "Elite", color: "#FFD700" };
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const formatScore = (score) => {
  return Math.round(score).toLocaleString();
};
