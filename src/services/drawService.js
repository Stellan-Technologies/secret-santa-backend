exports.drawAssignments = (participants) => {
  if (participants.length < 3) {
    throw new Error("At least 3 participants required");
  }

  const shuffled = [...participants];

  // Fisher–Yates shuffle (real randomness)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((giver, index) => ({
    giver,
    receiver: shuffled[(index + 1) % shuffled.length],
  }));
};
