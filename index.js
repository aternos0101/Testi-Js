const axios = require("axios");

const API_KEY = "AIzaSyCh0iyhVBSd6druf41-sulII5ipyhir8Zo"; // API key YouTube
const CHANNEL_ID = "UCGhh942Xu99XjvkTf8i0iRA"; // channel id kamu
const BLOCKED_WORDS = ["gak work", "penipuan", "nipu"];

module.exports = async (req, res) => {
  try {
    // 1. Ambil semua video dari channel
    const videoRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${CHANNEL_ID}&maxResults=10&order=date&type=video&key=${API_KEY}`
    );

    const videos = videoRes.data.items || [];

    for (const video of videos) {
      const videoId = video.id.videoId;

      // 2. Ambil komentar tiap video
      const commentRes = await axios.get(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&key=${API_KEY}`
      );

      const comments = commentRes.data.items || [];

      for (const c of comments) {
        const commentId = c.id;
        const text = c.snippet.topLevelComment.snippet.textDisplay.toLowerCase();

        // 3. Cek kata yang dilarang
        if (BLOCKED_WORDS.some(word => text.includes(word))) {
          // ⚠️ NOTE: untuk hapus komentar butuh OAuth2, API Key doang gak cukup
          console.log(`(SIMULASI) Komentar "${text}" dihapus dari video ${videoId}`);

          // Kalau mau real delete:
          // await axios.delete(
          //   `https://www.googleapis.com/youtube/v3/comments?id=${commentId}&key=${API_KEY}`,
          //   { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
          // );
        }
      }
    }

    res.status(200).json({ success: true, message: "Filter selesai dijalankan" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
