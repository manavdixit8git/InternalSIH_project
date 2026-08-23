import scenarios from "../data/scenarios.json";
import missions from "../data/missions.json";
import badges from "../data/badges.json";

export const scenarioService = {
  getAll: () => scenarios,
  getById: (id) => scenarios.find((s) => s.id === id) || null,
  getByLocation: (locationId) =>
    scenarios.filter((s) => s.location === locationId),
  getMissions: () => missions,
  getMissionById: (id) => missions.find((m) => m.id === id) || null,
  getBadges: () => badges,
  getBadgeById: (id) => badges.find((b) => b.id === id) || null,
};
