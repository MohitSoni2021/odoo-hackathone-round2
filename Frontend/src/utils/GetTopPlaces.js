import axios from "axios";

export async function getTopPlaces() {
  const titlesArray = [
    "Taj Mahal",
    "Golden Temple",
    "Red Fort",
    "Amer Fort",
    "Hawa Mahal",
    "Qutub Minar",
    "Kashi Vishwanath Temple",
    "Agra Fort",
    "Ellora Caves",
    "Goa"
  ];

  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    titlesArray.join("|")
  )}&prop=pageimages&format=json&pithumbsize=800`;

  try {
    const { data } = await axios.get(url);

    const pages = data.query.pages;

    const result = titlesArray.map(title => {
      const page = Object.values(pages).find(p => p.title === title) || {};
      return {
        src: page.thumbnail?.source || "https://via.placeholder.com/800x600?text=No+Image",
        title: page.title || title
      };
    });

    return result;
  } catch (error) {
    console.error("Error fetching top places:", error);
    return [];
  }
}

