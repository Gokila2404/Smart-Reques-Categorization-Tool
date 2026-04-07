const normalize = (value = "") => value.toLowerCase();

const containsAny = (text, keywords) => keywords.some((key) => text.includes(key));

const determinePriority = (title = "", description = "") => {
  const text = normalize(`${title} ${description}`);

  if (
    containsAny(text, ["network down", "no internet", "wifi down", "server down", "emergency", "urgent", "immediately"])
  ) {
    return "High";
  }

  if (containsAny(text, ["slow", "delay", "intermittent", "not working", "issue", "problem"])) {
    return "Medium";
  }

  if (containsAny(text, ["general query", "question", "request", "information"])) {
    return "Low";
  }

  return "Medium";
};

module.exports = determinePriority;
