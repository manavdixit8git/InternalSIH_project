import { storageService } from "./storageService";
import { scenarioService } from "./scenarioService";

// Records the result of a scenario choice and updates XP, stars, badges,
// category stats and the persistent world state.
export const progressService = {
  getProgress: () => storageService.getProgress(),
  getWorld: () => storageService.getWorld(),

  recordChoice(scenario, choice) {
    const progress = storageService.getProgress();
    const world = storageService.getWorld();

    // Category stats: count positive vs total attempts
    const cat = scenario.category;
    const stats = progress.categoryStats[cat] || { positive: 0, total: 0 };
    stats.total += 1;
    if (choice.type === "positive") stats.positive += 1;
    progress.categoryStats[cat] = stats;

    let newBadge = null;

    if (choice.type === "positive") {
      // Award XP only the first time a scenario is completed positively
      const already = progress.completed[scenario.id];
      progress.xp += choice.reward || 0;
      progress.stars += 1;
      progress.completed[scenario.id] = {
        choiceId: choice.id,
        at: Date.now(),
      };

      if (choice.badge && !progress.badges.includes(choice.badge)) {
        progress.badges.push(choice.badge);
        newBadge = scenarioService.getBadgeById(choice.badge);
      }
      void already;
    }

    // Update world visual state
    if (scenario.worldKey) {
      world[scenario.worldKey] =
        choice.type === "positive" ? "good" : "bad";
    }

    storageService.setProgress(progress);
    storageService.setWorld(world);

    return { progress, world, newBadge };
  },

  categoryPercent(category) {
    const progress = storageService.getProgress();
    const s = progress.categoryStats[category];
    if (!s || s.total === 0) return 0;
    return Math.round((s.positive / s.total) * 100);
  },

  totalScenarios: () => scenarioService.getAll().length,

  completedCount() {
    const progress = storageService.getProgress();
    return Object.keys(progress.completed).length;
  },

  reset() {
    storageService.setProgress({
      xp: 0,
      stars: 0,
      completed: {},
      badges: [],
      categoryStats: {},
    });
    storageService.setWorld({
      sky: "neutral",
      river: "neutral",
      water: "neutral",
      trees: "neutral",
      safety: "neutral",
      kindness: "neutral",
      school: "neutral",
      social: "neutral",
    });
  },
};
