//https://meownder-backend.onrender.com/api/profiles

const API_URL = "https://meownder-backend.onrender.com/api/profiles"; 

export async function getCats(count = 5) {
  try {
    const res = await fetch(`${API_URL}`);
    if (!res.ok) throw new Error("Error al obtener gatos");
    const data = await res.json();

    console.log(data);

    return data.map((url, i) => ({
      id: `cat-${Date.now()}-${i}`,
      imageUrl: url,
      isLoaded: true,
    }));
  } catch (err) {
    console.error("fetchCatBatch error:", err);
    return [];
  }
}
