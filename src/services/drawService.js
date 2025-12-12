exports.drawAssignments = (participants) => {
  const givers = [...participants];
  const receivers = [...participants];

  // Shuffle receivers until no one is matched to themselves
  receivers.sort(() => Math.random() - 0.5);

  let safe = false;
  while (!safe) {
    safe = true;

    for (let i = 0; i < givers.length; i++) {
      if (givers[i]._id.toString() === receivers[i]._id.toString()) {
        receivers.sort(() => Math.random() - 0.5);
        safe = false;
        break;
      }
    }
  }

  return givers.map((giver, i) => ({
    giver,
    receiver: receivers[i]
  }));
};
