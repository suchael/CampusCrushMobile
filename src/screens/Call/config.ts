export const setMediaBitrate = (sdp: string, bitrateKbps: number): string => {
  const lines = sdp.split("\n");
  let lineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("m=video") === 0) {
      lineIndex = i;
      break;
    }
  }
  if (lineIndex === -1) return sdp;

  lines.splice(lineIndex + 1, 0, `b=AS:${bitrateKbps}`);
  return lines.join("\n");
};


export const configuration = {
  iceServers: [
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.relay.metered.ca:80" },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "14ac8379c68dbe185b08299c",
      credential: "HEZcvpXcdoncmhHe",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "14ac8379c68dbe185b08299c",
      credential: "HEZcvpXcdoncmhHe",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "14ac8379c68dbe185b08299c",
      credential: "HEZcvpXcdoncmhHe",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "14ac8379c68dbe185b08299c",
      credential: "HEZcvpXcdoncmhHe",
    },
  ],
};

