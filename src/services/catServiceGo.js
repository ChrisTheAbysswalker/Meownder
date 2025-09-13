const API_URL = "http://localhost:8080/cats?count=5"; // tu Go API

export async function fetchCatBatch(count = 5) {
  try {
    const res = await fetch(`http://localhost:8080/cats?count=${count}`);
    if (!res.ok) throw new Error("Error al obtener gatos");
    const data = await res.json();
    // asumimos que data es un array de URLs
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
