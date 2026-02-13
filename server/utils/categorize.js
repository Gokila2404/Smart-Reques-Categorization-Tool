const categorizeComplaint = (description) => {
  const text = description.toLowerCase();

  if (text.includes("network") || text.includes("wifi") || text.includes("internet")) {
    return "Networking";
  }

  if (text.includes("fee") || text.includes("payment")) {
    return "Fees";
  }

  if (text.includes("discipline") || text.includes("misconduct")) {
    return "Discipline";
  }

  return "General";
};

module.exports = categorizeComplaint;
