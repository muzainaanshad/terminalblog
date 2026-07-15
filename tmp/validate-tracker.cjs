const t = require("../backlinks-tracker.json");
console.log("JSON OK. placed=", t.placed.length,
  "| communityPending=", t.communityOpportunitiesPendingManualPost.length,
  "| resourceLeads=", t.resourcePageOutreach[0].targets.length);
console.log("Today cycle-2 Marky post present:",
  t.placed.some(p => p.postId === "27015d36-4a6c-4158-814a-f98e26a6f3bb"));
